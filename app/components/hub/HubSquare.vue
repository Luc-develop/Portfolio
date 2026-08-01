<script setup lang="ts">
import { gsap } from 'gsap'
import type { HubNodeData } from '~/data/hubNodes'

const props = defineProps<{
  node: HubNodeData
  index: number
  interactive: boolean
  active: boolean
}>()

const emit = defineEmits<{ select: [] }>()

const squareRef = ref<HTMLElement | null>(null)
const { colors } = useSectionPalette()

const color = computed(() => colors[props.node.key].square)

// Inclinaison alternée d'un carré à l'autre : droite, gauche, droite.
const tilt = computed(() => (props.index % 2 === 0 ? 3 : -3))

// Halo permanent sur le carré de la section courante. En style inline (et non via une
// classe) pour qu'il prenne le pas sur le survol : c'est le même halo, il ne doit pas
// s'allumer et s'éteindre selon la position de la souris.
// Le liseré clair renforce la distinction avec le fond de la section, de la même teinte.
// Il est passé dans le même box-shadow qu'un `ring` Tailwind aurait utilisé, sans quoi les
// deux s'écraseraient.
const glow = computed(() =>
  props.active ? `0 0 0 2px rgba(241,245,249,0.9), 0 0 28px ${color.value}` : undefined,
)

// Le survol est animé par GSAP, pas par une transition CSS : une transition sur
// `transform` s'appliquerait aussi aux valeurs que le tiroir écrit frame par frame
// (ouverture, chute, Flip), qui se mettraient à traîner et à s'enchaîner les unes dans
// les autres. Seul box-shadow, que GSAP ne touche pas, reste en transition CSS.
// Au toucher, mouseenter est émis à l'appui mais mouseleave ne suit pas toujours : le
// carré resterait agrandi et incliné indéfiniment.
function canHover(): boolean {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

function onEnter() {
  if (!canHover() || !props.interactive || !squareRef.value) return
  gsap.to(squareRef.value, { scale: 1.1, rotation: tilt.value, duration: 0.3, ease: 'power2.out' })
}

function onLeave() {
  if (!canHover() || !props.interactive || !squareRef.value) return
  gsap.to(squareRef.value, { scale: 1, rotation: 0, duration: 0.3, ease: 'power2.out' })
}
</script>

<template>
  <button
    ref="squareRef"
    type="button"
    :style="{ backgroundColor: color, '--node-glow': color, boxShadow: glow }"
    :aria-current="active ? 'true' : undefined"
    class="hub-square invisible opacity-0 flex items-center justify-center
           w-16 h-16 lg:w-24 lg:h-24 rounded-lg text-slate-100 text-xs font-medium text-center px-1
           shadow-lg outline-none transition-[box-shadow] duration-300 ease-out
           hover:shadow-[0_0_28px_var(--node-glow)]
           focus-visible:shadow-[0_0_28px_var(--node-glow)]"
    @click="emit('select')"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    {{ node.label }}
  </button>
</template>
