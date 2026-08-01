<script setup lang="ts">
import { gsap } from 'gsap'
import { useHubSquaresDrawer } from '~/composables/useHubSquaresDrawer'
import { hubNodes } from '~/data/hubNodes'

defineProps<{ activePanel: number }>()

const emit = defineEmits<{ select: [panel: number] }>()

const burgerRef = ref<HTMLElement | null>(null)
const listRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const { setClosedState, open, close, watchResponsiveLayout } = useHubSquaresDrawer()

let squares: HTMLElement[] = []
let stopWatchingLayout: (() => void) | undefined

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeDrawer()
}

onMounted(() => {
  // Le composant n'est monté qu'à la fin de l'intro : animer à ce moment revient à animer
  // son apparition. Le tween porte sur l'enveloppe et non sur le bouton, dont le transform
  // appartient à sa transition de survol.
  if (burgerRef.value) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Léger retard sur le badge de disponibilité : les deux coins de l'écran se remplissent
    // l'un après l'autre plutôt qu'en même temps.
    gsap.fromTo(
      burgerRef.value,
      { autoAlpha: 0, y: reduced ? 0 : -12 },
      { autoAlpha: 1, y: 0, duration: reduced ? 0 : 0.6, ease: 'power2.out', delay: reduced ? 0 : 0.25 },
    )
  }

  if (!listRef.value) return
  squares = Array.from(listRef.value.querySelectorAll<HTMLElement>('.hub-square'))
  setClosedState(squares)

  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  stopWatchingLayout?.()
  window.removeEventListener('keydown', onKeydown)
})

function openDrawer() {
  isOpen.value = true
  open(squares).then(() => {
    // Flip ne doit surveiller le resize qu'une fois l'entrée terminée : sinon il
    // capturerait la position encore décalée par l'animation comme référence.
    if (!isOpen.value) return
    stopWatchingLayout?.()
    stopWatchingLayout = watchResponsiveLayout(squares)
  })
}

function closeDrawer() {
  if (!isOpen.value) return
  isOpen.value = false
  stopWatchingLayout?.()
  stopWatchingLayout = undefined
  close(squares)
}

function toggle() {
  if (isOpen.value) {
    closeDrawer()
  } else {
    openDrawer()
  }
}
</script>

<template>
  <!-- L'enveloppe porte le positionnement et l'animation d'apparition, le bouton garde son
       propre transform pour le survol : les deux ne doivent pas se disputer la propriété. -->
  <span ref="burgerRef" class="invisible fixed top-6 left-6 z-50 block">
    <button
      type="button"
      :aria-expanded="isOpen"
      aria-label="Afficher les sections"
      class="flex items-center justify-center w-10 h-10
             rounded-full bg-slate-900 text-slate-100 shadow-lg
             ring-1 ring-inset ring-slate-100/20
             transition-transform duration-300 hover:scale-110"
      @click="toggle"
    >
      <span class="relative block w-4 h-3">
        <span
          class="absolute left-0 top-0 w-4 h-0.5 bg-slate-100 transition-transform duration-300"
          :class="isOpen ? 'translate-y-[5px] rotate-45' : ''"
        />
        <span
          class="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-slate-100 transition-opacity duration-200"
          :class="isOpen ? 'opacity-0' : ''"
        />
        <span
          class="absolute left-0 bottom-0 w-4 h-0.5 bg-slate-100 transition-transform duration-300"
          :class="isOpen ? '-translate-y-[5px] -rotate-45' : ''"
        />
      </span>
    </button>
  </span>

  <!-- Le conteneur garde sa boîte même quand les carrés sont déplacés hors écran, et une
       boîte vide capte quand même les clics : il faut donc lui retirer explicitement les
       événements tant que le tiroir est fermé. -->
  <div
    ref="listRef"
    :aria-hidden="!isOpen"
    class="fixed top-24 left-6 z-30 flex flex-col gap-3 lg:flex-row"
    :class="isOpen ? 'pointer-events-auto' : 'pointer-events-none'"
  >
    <!-- interactive : le survol ne doit pas lancer ses propres tweens de transform
         pendant que le tiroir s'ouvre ou que les carrés tombent. -->
    <HubSquare
      v-for="(node, index) in hubNodes"
      :key="node.key"
      :node="node"
      :index="index"
      :interactive="isOpen"
      :active="activePanel === node.panel"
      @select="emit('select', node.panel)"
    />
  </div>
</template>
