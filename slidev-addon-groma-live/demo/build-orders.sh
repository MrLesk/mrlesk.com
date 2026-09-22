#!/usr/bin/env bash
# Builds the "order service" demo repository that the timelapse replays, and packs it
# into orders.bundle next to this script.
#
# Every commit is one visible event on the Groma map: a planned task, a task going in
# progress, a component appearing after a real `groma scan`, its description, a task done.
# Nothing in it is drawn by hand: tasks come from the real `backlog` CLI, components from
# the real TypeScript scanner, names and relationships from the real `groma` CLI.
#
#   ./build-orders.sh            # needs `groma`, `backlog` and the Groma repo for its scanner
#
# GROMA_REPO points at the Groma checkout whose TypeScript scanner is used (default ~/projects/groma3).
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
GROMA_REPO="${GROMA_REPO:-$HOME/projects/groma3}"
WORK="$(mktemp -d)/orders"
LOG="$(mktemp)"
mkdir -p "$WORK" && cd "$WORK"

# Fixed identity and clock, so rebuilding gives the same history.
export GIT_AUTHOR_NAME="Claude" GIT_AUTHOR_EMAIL="agent@groma.md"
export GIT_COMMITTER_NAME="Claude" GIT_COMMITTER_EMAIL="agent@groma.md"
CLOCK=1790000000
# A step that changed nothing is not a frame.
commit() {
  git add -A
  git diff --cached --quiet && return 0
  CLOCK=$((CLOCK + 420))
  GIT_AUTHOR_DATE="@$CLOCK" GIT_COMMITTER_DATE="@$CLOCK" git commit -q -m "$1"
}
# Commands are quiet on success. When one fails, its output is printed and the build stops.
quiet() { "$@" >>"$LOG" 2>&1 </dev/null || { echo "FAILED: $*"; tail -20 "$LOG"; exit 1; }; }
owner_of() { groma view "$1" --plain 2>/dev/null </dev/null | awk 'NR==3 { print $1 }'; }
# relate <from> <to> <what for> [how]: code endpoints are source files, people and external systems are ids.
# Most collaborations here are plain function calls.
relate() { quiet groma add relation "$1" "$2" --description "$3" --technology "${4:-TypeScript call}"; }
plan() { quiet backlog task create "$1" -d "$2" --ref "$SYSTEM" -a @claude; commit "Plan: $1"; }

# Groma places a component in the application container when the entry point (package.json "bin") reaches its file.
# Each task therefore wires its module into the server, as a real change would.
wire() { printf "import '%s'\n%s" "$1" "$(cat src/api/server.ts)" > src/api/server.ts; }

# work <task> <component id> <title> <group> <description> <files...>
# The commit subjects are what the timelapse prints under the map, so they read as sentences.
work() {
  local task="$1" id="$2" title="$3" group="$4" description="$5"; shift 5
  local flags=(); for file in "$@"; do flags+=(--modified-file "$file"); done
  local goal; goal="$(backlog task view "$task" --plain </dev/null | sed -n "s/^Task $task - //p" | head -1)"

  quiet backlog task edit "$task" -s "In Progress"
  commit "$task in progress: $goal"

  quiet groma scan
  # The scanner names components after their files. Fold a task's files into one component
  # and give it the id the rest of this script uses.
  local found; found="$(owner_of "$1")"
  for file in "${@:2}"; do
    local other; other="$(owner_of "$file")"
    [ "$other" = "$found" ] || quiet groma edit "$found" --combine "$other"
  done
  [ "$found" = "$id" ] || quiet groma edit "$found" --id "$id"
  quiet backlog task edit "$task" "${flags[@]}" --add-ref "$id"
  commit "$task: the scan finds new code"

  quiet groma edit "$id" --title "$title" --description "$description" --group "$group"
  commit "$task: the agent names it $title"

  quiet backlog task edit "$task" -s "Done"
  commit "$task done: $goal"
}

# ---------------------------------------------------------------- an empty project
git init -q -b main .
cat > package.json <<'JSON'
{ "name": "order-service", "type": "module", "private": true, "bin": { "order-service": "src/api/server.ts" } }
JSON
cat > tsconfig.json <<'JSON'
{ "compilerOptions": { "target": "ES2022", "module": "ESNext", "moduleResolution": "Bundler", "strict": true, "allowImportingTsExtensions": true, "noEmit": true }, "include": ["src"] }
JSON
quiet groma init "Order service" --directory groma
cat > groma/scanners.json <<JSON
{ "scanners": [ { "id": "typescript", "source": "$GROMA_REPO/plugins/scanners/typescript" } ] }
JSON
backlog init "Order service" --defaults --check-branches false --include-remote false --auto-open-browser false >>"$LOG" 2>&1 </dev/null || true
rm -f AGENTS.md CLAUDE.md
mkdir -p src/api src/catalog src/cart src/inventory src/payments src/orders src/checkout src/notifications
commit "Start an empty order service"

# ---------------------------------------------------------------- first task: a skeleton to grow from
# Groma has no system to draw until a scan finds code, so the first task is the service skeleton.
quiet backlog task create "Set up the service skeleton" -d "A running HTTP service that every later task plugs into." -a @claude
commit "Plan: Set up the service skeleton"
cat > src/api/server.ts <<'TS'
Bun.serve({
  port: 3000,
  routes: {
    '/health': { GET: () => Response.json({ status: 'ok' }) },
  },
})
TS
work TASK-1 api "HTTP API" "Delivery" "The HTTP endpoints the shop front end calls" src/api/server.ts
SYSTEM="$(awk '/^  id:/ { print $2; exit }' groma/systems/*/system.md)"

# ---------------------------------------------------------------- who uses it
quiet groma add actor "Customer" --description "Buys products and follows their orders" --overview "A shopper using the shop front end. They fill a cart, pay for it, and later check what happened to their orders."
quiet groma add external "Payment provider" --description "Charges cards for an order" --technology "HTTPS API" --overview "The external company that takes the money. The order service sends it a charge and never stores card data itself."
quiet groma add external "Email service" --description "Delivers transactional email" --technology "HTTPS API" --overview "The external service that delivers order confirmations to customers."
relate customer src/api/server.ts "Fills a cart, checks out and follows orders" "HTTPS"
# The scan found the application through package.json "bin"; give it a name a reader recognizes.
CONTAINER="$(awk '/^  id:/ { print $2; exit }' groma/systems/*/containers/*/container.md)"
quiet groma edit "$CONTAINER" --title "API server" --description "The Bun service behind the shop" --technology "Bun, TypeScript"
commit "Describe who uses the order service"

# ---------------------------------------------------------------- the plan, pinned on the system
plan "Model the product catalog"            "Checkout needs product names and prices it can trust."
plan "Let customers fill a cart"            "Customers collect products before they decide to buy."
plan "Reserve stock for a cart"             "An order must never promise a product that is out of stock."
plan "Charge payments through the provider" "Money is taken by the external payment provider, never stored here."
plan "Own the order lifecycle and history"  "One place decides what state an order is in and remembers it."
plan "Turn an approved cart into an order"  "Checkout coordinates stock, payment and the order in one step."
plan "Email order confirmations"            "Customers expect a confirmation as soon as the order is placed."
plan "Open the API to the shop front end"   "The shop front end fills carts, checks out and lists orders over HTTP."

# ---------------------------------------------------------------- one task at a time
cat > src/catalog/catalog.ts <<'TS'
export interface Product { sku: string; name: string; priceInCents: number }

const products = new Map<string, Product>()

export function addProduct(product: Product): void {
  products.set(product.sku, product)
}

/** Checkout prices a cart from the catalog, never from what the browser sent. */
export function findProduct(sku: string): Product {
  const product = products.get(sku)
  if (product === undefined) throw new Error(`Unknown product ${sku}`)
  return product
}
TS
wire ../catalog/catalog.ts
work TASK-2 catalog "Product catalog" "Shopping" "Knows every product and its current price" src/catalog/catalog.ts

cat > src/cart/cart.ts <<'TS'
import { findProduct } from '../catalog/catalog.ts'

export interface CartLine { sku: string; quantity: number }
export interface Cart { customerId: string; lines: CartLine[] }

export function addToCart(cart: Cart, sku: string, quantity: number): Cart {
  findProduct(sku)
  const existing = cart.lines.find(line => line.sku === sku)
  const lines = existing === undefined
    ? [...cart.lines, { sku, quantity }]
    : cart.lines.map(line => line.sku === sku ? { sku, quantity: line.quantity + quantity } : line)
  return { ...cart, lines }
}

export function cartTotalInCents(cart: Cart): number {
  return cart.lines.reduce((total, line) => total + findProduct(line.sku).priceInCents * line.quantity, 0)
}
TS
wire ../cart/cart.ts
work TASK-3 cart "Cart" "Shopping" "Collects what a customer wants to buy and prices it" src/cart/cart.ts
relate src/cart/cart.ts src/catalog/catalog.ts "Looks up products and prices"

cat > src/inventory/inventory.ts <<'TS'
import type { CartLine } from '../cart/cart.ts'

const stock = new Map<string, number>()

export function restock(sku: string, quantity: number): void {
  stock.set(sku, (stock.get(sku) ?? 0) + quantity)
}

/** All or nothing: a cart is only reserved when every line is in stock. */
export function reserveStock(lines: CartLine[]): boolean {
  if (lines.some(line => (stock.get(line.sku) ?? 0) < line.quantity)) return false
  for (const line of lines) stock.set(line.sku, stock.get(line.sku)! - line.quantity)
  return true
}

export function releaseStock(lines: CartLine[]): void {
  for (const line of lines) restock(line.sku, line.quantity)
}
TS
wire ../inventory/inventory.ts
work TASK-4 inventory "Inventory" "Fulfilment" "Reserves and releases stock so an order never oversells" src/inventory/inventory.ts

cat > src/payments/payment-gateway.ts <<'TS'
export interface Charge { orderId: string; amountInCents: number; cardToken: string }
export type ChargeResult = { approved: true; reference: string } | { approved: false; reason: string }

const PROVIDER_URL = 'https://payments.example.com/charges'

/** The only place that talks to the payment provider. Card data never touches our storage. */
export async function charge(request: Charge): Promise<ChargeResult> {
  const response = await fetch(PROVIDER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!response.ok) return { approved: false, reason: `provider answered ${response.status}` }
  const { reference } = await response.json() as { reference: string }
  return { approved: true, reference }
}
TS
wire ../payments/payment-gateway.ts
work TASK-5 payments "Payment gateway" "Integrations" "Charges a card through the external payment provider" src/payments/payment-gateway.ts
relate src/payments/payment-gateway.ts payment-provider "Requests a charge for an order" "HTTPS API"

cat > src/orders/order-repository.ts <<'TS'
import type { Order } from './orders.ts'

const orders = new Map<string, Order>()

export function saveOrder(order: Order): void {
  orders.set(order.id, order)
}

export function loadOrder(id: string): Order | undefined {
  return orders.get(id)
}

export function ordersOf(customerId: string): Order[] {
  return [...orders.values()].filter(order => order.customerId === customerId)
}
TS
cat > src/orders/orders.ts <<'TS'
import type { CartLine } from '../cart/cart.ts'
import { loadOrder, saveOrder } from './order-repository.ts'

export type OrderStatus = 'placed' | 'paid' | 'shipped' | 'cancelled'
export interface Order { id: string; customerId: string; lines: CartLine[]; totalInCents: number; status: OrderStatus }

const NEXT: Record<OrderStatus, OrderStatus[]> = { placed: ['paid', 'cancelled'], paid: ['shipped', 'cancelled'], shipped: [], cancelled: [] }

export function placeOrder(order: Omit<Order, 'status'>): Order {
  const placed: Order = { ...order, status: 'placed' }
  saveOrder(placed)
  return placed
}

/** The only place that decides which order states may follow each other. */
export function moveOrder(id: string, status: OrderStatus): Order {
  const order = loadOrder(id)
  if (order === undefined) throw new Error(`Unknown order ${id}`)
  if (!NEXT[order.status].includes(status)) throw new Error(`An order cannot go from ${order.status} to ${status}`)
  const moved = { ...order, status }
  saveOrder(moved)
  return moved
}
TS
wire ../orders/orders.ts
work TASK-6 orders "Orders" "Fulfilment" "Owns the order lifecycle and its history" src/orders/orders.ts src/orders/order-repository.ts

cat > src/checkout/checkout.ts <<'TS'
import { type Cart, cartTotalInCents } from '../cart/cart.ts'
import { releaseStock, reserveStock } from '../inventory/inventory.ts'
import { moveOrder, placeOrder, type Order } from '../orders/orders.ts'
import { charge } from '../payments/payment-gateway.ts'

export type CheckoutResult = { ok: true; order: Order } | { ok: false; reason: string }

/** Turns an approved cart into an order: reserve stock, place the order, charge, confirm. */
export async function checkout(cart: Cart, cardToken: string): Promise<CheckoutResult> {
  if (!reserveStock(cart.lines)) return { ok: false, reason: 'out of stock' }
  const order = placeOrder({ id: crypto.randomUUID(), customerId: cart.customerId, lines: cart.lines, totalInCents: cartTotalInCents(cart) })
  const payment = await charge({ orderId: order.id, amountInCents: order.totalInCents, cardToken })
  if (!payment.approved) {
    releaseStock(cart.lines)
    moveOrder(order.id, 'cancelled')
    return { ok: false, reason: payment.reason }
  }
  return { ok: true, order: moveOrder(order.id, 'paid') }
}
TS
wire ../checkout/checkout.ts
work TASK-7 checkout "Checkout" "Fulfilment" "Turns an approved cart into a paid order" src/checkout/checkout.ts
relate src/checkout/checkout.ts src/inventory/inventory.ts "Reserves stock, and releases it when payment fails"
relate src/checkout/checkout.ts src/orders/orders.ts "Places the order and moves it to paid or cancelled"
relate src/checkout/checkout.ts src/payments/payment-gateway.ts "Charges the order total"
relate src/checkout/checkout.ts src/cart/cart.ts "Reads the cart lines and total"
commit "Explain how checkout works with its neighbours"

cat > src/notifications/order-emails.ts <<'TS'
import type { Order } from '../orders/orders.ts'

const EMAIL_URL = 'https://email.example.com/send'

export async function sendOrderConfirmation(order: Order, email: string): Promise<void> {
  await fetch(EMAIL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: email, template: 'order-confirmation', order: { id: order.id, totalInCents: order.totalInCents } }),
  })
}
TS
wire ../notifications/order-emails.ts
work TASK-8 notifications "Order emails" "Integrations" "Tells the customer what happened to their order" src/notifications/order-emails.ts
relate src/notifications/order-emails.ts email-service "Sends the confirmation email" "HTTPS API"

cat > src/api/server.ts <<'TS'
import { addToCart, type Cart } from '../cart/cart.ts'
import { checkout } from '../checkout/checkout.ts'
import { sendOrderConfirmation } from '../notifications/order-emails.ts'
import { ordersOf } from '../orders/order-repository.ts'

const carts = new Map<string, Cart>()
const cartOf = (customerId: string): Cart => carts.get(customerId) ?? { customerId, lines: [] }

Bun.serve({
  port: 3000,
  routes: {
    '/customers/:id/cart': {
      POST: async request => {
        const { sku, quantity } = await request.json() as { sku: string; quantity: number }
        const cart = addToCart(cartOf(request.params.id), sku, quantity)
        carts.set(cart.customerId, cart)
        return Response.json(cart)
      },
    },
    '/customers/:id/checkout': {
      POST: async request => {
        const { cardToken, email } = await request.json() as { cardToken: string; email: string }
        const result = await checkout(cartOf(request.params.id), cardToken)
        if (!result.ok) return Response.json(result, { status: 409 })
        carts.delete(request.params.id)
        await sendOrderConfirmation(result.order, email)
        return Response.json(result.order, { status: 201 })
      },
    },
    '/customers/:id/orders': { GET: request => Response.json(ordersOf(request.params.id)) },
  },
})
TS
work TASK-9 api "HTTP API" "Delivery" "The HTTP endpoints the shop front end calls" src/api/server.ts
relate src/api/server.ts src/cart/cart.ts "Adds products to the customer's cart"
relate src/api/server.ts src/checkout/checkout.ts "Starts checkout for the customer's cart"
relate src/api/server.ts src/notifications/order-emails.ts "Asks for the order confirmation"
commit "Explain what the HTTP API calls"

# ---------------------------------------------------------------- pack it
rm -f "$HERE/orders.bundle"
git bundle create "$HERE/orders.bundle" main >>"$LOG" 2>&1
echo "orders.bundle: $(git rev-list --count main) commits, built in $WORK"
