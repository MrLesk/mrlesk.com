import tokens from '@slidev/client/.generated/unocss-tokens.ts'

// Slidev 52.19.1 loads this default export as a module object in dev mode.
// Supply the token array so the presenter toolbar keeps its styles and icons.
export default {
  safelist: tokens,
}
