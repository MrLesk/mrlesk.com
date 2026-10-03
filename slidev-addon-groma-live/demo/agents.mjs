// Three agents working Backlog.md tasks in the demo order service, phase by phase.
// Taken from the groma.md x Backlog.md film: the same tasks, the same source edits, the same
// `backlog` commands. A `scenario` instance in the deck's headmatter runs these steps for real in a
// fresh clone of orders.bundle while Groma watches it, one phase per slide click.

/** Who works on what. `create` holds the arguments of `backlog task create`. */
export const TASKS = {
  'TASK-10': {
    agent: '@codex',
    create: ['Offer discount codes', '-d', 'Customers enter a code at checkout and pay less.',
      '--ac', 'The cart accepts a discount code', '--ac', 'Checkout applies the discount to the total', '--ac', 'Payments charge the discounted amount', '--ref', 'cart'],
  },
  'TASK-11': {
    agent: '@claude',
    create: ['Refund cancelled orders', '-d', 'Cancelling a paid order gives the money back.',
      '--ac', 'Cancelling a paid order starts a refund', '--ac', 'The payment provider refunds the charge', '--ac', 'The customer gets a refund email', '--ref', 'orders'],
  },
  'TASK-12': {
    agent: '@antigravity',
    create: ['Warn when stock runs low', '-d', 'The shop hears about low stock before carts fail.',
      '--ac', 'Inventory tracks a low-stock threshold', '--ac', 'The catalog lists products that run low', '--ac', 'Low stock sends an alert email', '--ref', 'inventory'],
  },
}

/** How each agent is named on the slide, and the name its commits carry. */
export const AGENTS = {
  '@codex': 'Codex',
  '@claude': 'Claude Code',
  '@antigravity': 'Antigravity',
}

/** Source edits, appended to the service's files. */
export const EDITS = {
  cart: ['src/cart/cart.ts', `
/** A discount code the customer entered, kept on the cart until checkout. */
export function applyDiscountCode(cart: Cart, code: string): Cart & { discountCode: string } {
  return { ...cart, discountCode: code.trim().toUpperCase() }
}
`],
  checkout: ['src/checkout/checkout.ts', `
const DISCOUNTS: Record<string, number> = { WELCOME10: 10 }

/** The total after the cart's discount code, in whole cents. */
export function discountedTotalInCents(cart: Cart & { discountCode?: string }): number {
  const percent = DISCOUNTS[cart.discountCode ?? ''] ?? 0
  return Math.round(cartTotalInCents(cart) * (100 - percent) / 100)
}
`],
  discountCharge: ['src/payments/payment-gateway.ts', `
/** Charges the discounted amount and names the code on the provider's receipt. */
export function discountedCharge(request: Charge, discountCode?: string): Charge & { description?: string } {
  return discountCode === undefined ? request : { ...request, description: \`Discount \${discountCode}\` }
}
`],
  cancel: ['src/orders/orders.ts', `
/** Cancelling a paid order starts a refund; the gateway gives the money back. */
export function cancelPaidOrder(id: string): { order: Order; refund: boolean } {
  const refund = loadOrder(id)?.status === 'paid'
  return { order: moveOrder(id, 'cancelled'), refund }
}
`],
  refund: ['src/payments/payment-gateway.ts', `
/** Asks the provider to return a charge in full. */
export async function refund(reference: string): Promise<boolean> {
  const response = await fetch(\`\${PROVIDER_URL}/\${reference}/refunds\`, { method: 'POST' })
  return response.ok
}
`],
  refundEmail: ['src/notifications/order-emails.ts', `
export async function sendRefundConfirmation(order: Order, email: string): Promise<void> {
  await fetch(EMAIL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: email, template: 'refund-confirmation', order: { id: order.id, totalInCents: order.totalInCents } }),
  })
}
`],
  threshold: ['src/inventory/inventory.ts', `
/** Below this many units a product counts as running low. */
export const LOW_STOCK_THRESHOLD = 5

export function isLow(sku: string): boolean {
  return (stock.get(sku) ?? 0) < LOW_STOCK_THRESHOLD
}
`],
  lowList: ['src/catalog/catalog.ts', `
/** The products running low, so the shop can reorder in time. */
export function lowStockProducts(isLow: (sku: string) => boolean): Product[] {
  return [...products.values()].filter(product => isLow(product.sku))
}
`],
  lowAlert: ['src/notifications/order-emails.ts', `
export async function sendLowStockAlert(skus: string[], email: string): Promise<void> {
  await fetch(EMAIL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: email, template: 'low-stock-alert', skus }),
  })
}
`],
}

/**
 * The steps, by phase. Phase 0 is the service before the agents start.
 * `create` plans a task, `take` hands it to its agent (assignee and In Progress), `edit` writes the
 * source and records the files and the component the agent touched, `check` ticks acceptance
 * criteria, `done` ticks the last one, commits the task's work under its ID and title, and closes it.
 */
export const STEPS = [
  { phase: 1, task: 'TASK-10', kind: 'create' },
  { phase: 1, task: 'TASK-11', kind: 'create' },
  { phase: 1, task: 'TASK-12', kind: 'create' },

  { phase: 2, task: 'TASK-10', kind: 'take' },
  { phase: 2, task: 'TASK-11', kind: 'take' },
  { phase: 2, task: 'TASK-12', kind: 'take' },

  { phase: 3, task: 'TASK-12', kind: 'edit', edits: ['threshold', 'lowList'], ref: 'catalog' },
  { phase: 3, task: 'TASK-11', kind: 'edit', edits: ['refund'], ref: 'payments', check: [2] },
  { phase: 3, task: 'TASK-10', kind: 'edit', edits: ['cart'], ref: 'cart', check: [1] },
  { phase: 3, task: 'TASK-12', kind: 'check', check: [1] },
  { phase: 3, task: 'TASK-10', kind: 'edit', edits: ['checkout'], ref: 'checkout' },
  { phase: 3, task: 'TASK-12', kind: 'check', check: [2] },
  { phase: 3, task: 'TASK-11', kind: 'edit', edits: ['refundEmail'], ref: 'notifications', check: [3] },
  { phase: 3, task: 'TASK-10', kind: 'check', check: [2] },
  { phase: 3, task: 'TASK-11', kind: 'edit', edits: ['cancel'], ref: 'orders' },
  { phase: 3, task: 'TASK-12', kind: 'edit', edits: ['lowAlert'], ref: 'notifications' },
  { phase: 3, task: 'TASK-11', kind: 'check', check: [1] },
  { phase: 3, task: 'TASK-10', kind: 'edit', edits: ['discountCharge'], ref: 'payments' },

  { phase: 4, task: 'TASK-11', kind: 'done' },
  { phase: 4, task: 'TASK-12', kind: 'done', check: [3] },
  { phase: 4, task: 'TASK-10', kind: 'done', check: [3] },
]
