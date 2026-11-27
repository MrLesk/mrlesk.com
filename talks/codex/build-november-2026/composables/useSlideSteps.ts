import { useIsSlideActive, useSlideContext } from '@slidev/client'
import { computed } from 'vue'

/** The two places where the audience or the presenter watches the real slide. */
const LIVE_VIEWS = ['slide', 'presenter']

/**
 * Tells an animated slide component where the presenter is on its slide.
 *
 * Use it once per component and put `stepClasses` on the root element:
 *
 *   const { step, isLive, stepClasses } = useSlideSteps(2)
 *   <div class="my-stage" :class="stepClasses">
 *
 * - `step` is the number of clicks made on the slide: 0 when it opens, at most `stepCount`.
 *   The slide's `clicks:` frontmatter must be the same number.
 * - `stepClasses` holds `s1` to `s{stepCount}`. `s2` is on from the second click onwards, so
 *   the CSS for each step builds on the step before it and a click back undoes it.
 * - `isLive` is true only while this slide is on screen for real. It is false in the slide
 *   overview, in the presenter's "next slide" preview and in exports. Timed effects such as
 *   typing check it, so those views show the finished picture instead of a half-played one.
 */
export function useSlideSteps(stepCount: number) {
  const isActive = useIsSlideActive()
  const { $clicks, $renderContext } = useSlideContext()

  // The overview and exports report a very high click count to mean "show everything".
  const step = computed(() => Math.min($clicks.value, stepCount))
  const isLive = computed(() => isActive.value && LIVE_VIEWS.includes($renderContext.value))

  const stepClasses = computed(() => {
    const classes: Record<string, boolean> = {}
    for (let number = 1; number <= stepCount; number++) {
      classes[`s${number}`] = step.value >= number
    }
    return classes
  })

  return { step, isLive, stepClasses }
}

export type SlideSteps = ReturnType<typeof useSlideSteps>
