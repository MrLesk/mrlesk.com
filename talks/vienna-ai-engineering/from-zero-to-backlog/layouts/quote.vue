<template>
  <div class="slidev-layout quote">
    <CornerCurves class="absolute left-0 top-0 transform rotate-90" />
    <div class="flex flex-col justify-center items-center min-h-full py-20">
      <div class="max-w-5xl mx-auto px-16 relative">
        <!-- Opening quote mark -->
        <div class="quote-mark-open absolute -top-1 -left-1 text-secondary text-8xl opacity-60 font-serif leading-none">&ldquo;</div>

        <!-- Quote content -->
        <div class="quote-text text-center relative z-10">
          <slot></slot>
        </div>

        <!-- Closing quote mark -->
        <div class="quote-mark-close absolute -bottom-24 -right-1 text-secondary text-8xl opacity-60 font-serif leading-none">&rdquo;</div>
      </div>
    </div>
    <AsGraphic
      type="zigzag"
      class="absolute top-20 -right-30"
    />
  </div>
</template>

<style>
.slidev-layout.quote {
  /* Main quote text styling */
  .quote-text p:first-child,
  .quote-text h1:first-child {
    @apply text-5xl leading-tight text-primary font-light mb-16;
    font-family: 'Georgia', 'Times New Roman', serif;
    line-height: 1.3;
    margin-top: 0;
  }

  /* Attribution styling */
  .quote-text p:last-child {
    @apply text-2xl text-primary opacity-60 font-medium not-italic;
    font-family: inherit;
    margin-bottom: 0;
    margin-top: 2rem;
  }


  /* Quote marks */
  .quote-mark-open,
  .quote-mark-close {
    font-family: 'Georgia', 'Times New Roman', serif;
    user-select: none;
    pointer-events: none;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .quote-text p:first-child,
    .quote-text h1:first-child {
      @apply text-4xl;
    }

    .quote-text p:last-child {
      @apply text-xl;
    }
  }
}
</style>