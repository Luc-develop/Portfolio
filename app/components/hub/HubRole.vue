<script setup lang="ts">
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'

// active : le hub est-il la section à l'écran. Le panneau n'est jamais démonté — il reste
// épinglé en position: fixed derrière les sections suivantes —, donc sans cette information
// la boucle continuerait de tourner hors champ.
const props = withDefaults(defineProps<{ morph?: boolean, active?: boolean }>(), { active: true })

const textRef = ref<HTMLElement | null>(null)
const altRef = ref<HTMLElement | null>(null)
const cursorRef = ref<HTMLElement | null>(null)
const cursorBlinking = ref(true)

// Flou proportionné à la taille du texte (~1/5 de la font-size) : au-delà, le mot devient
// une tache informe au lieu de rester lisible en se déformant.
const MORPH_BLUR = 4
const MORPH_DURATION = 0.45
const HOLD_DURATION = 2.5
// Délai entre la fin de la frappe et le tout premier morph, plus court que les pauses
// de la boucle : le mot vient d'apparaître lettre par lettre, il n'a pas besoin d'être
// contemplé aussi longtemps qu'aux tours suivants.
const FIRST_HOLD = 0.3
const MORPH_EASE = 'power2.inOut'

let split: SplitText | undefined
let loop: gsap.core.Timeline | undefined

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

onMounted(() => {
  if (!textRef.value || !altRef.value) return
  split = SplitText.create(textRef.value, {
    type: 'chars',
    charsClass: 'hub-role-char',
  })
  // textRef démarre en opacity-0 (classe statique, anti-flash au premier rendu, avant
  // que SplitText n'existe côté client) : on rend le conteneur visible et on masque
  // chaque lettre individuellement, pour que useHubIntro.ts puisse ensuite les révéler
  // une par une sans jamais montrer le mot entier d'un coup.
  gsap.set(textRef.value, { opacity: 1 })
  gsap.set(split.chars, { opacity: 0 })
  gsap.set(altRef.value, { opacity: 0 })
})

onUnmounted(() => {
  loop?.kill()
  split?.revert()
})

// La boucle ne démarre qu'une fois la frappe terminée (pilotée par la page) : les deux
// mots se superposent en grille, donc morpher pendant que SplitText révèle encore les
// lettres montrerait "fullstack junior" par-dessus le mot en cours d'écriture.
watch(() => props.morph, (active) => {
  if (!active || loop || prefersReducedMotion()) return
  const text = textRef.value
  const alt = altRef.value
  if (!text || !alt) return

  stopCursor()

  // repeatDelay tient lieu de pause finale sur "développeur web" : sans elle, le retour
  // au début du timeline enchaînerait immédiatement sur le morph suivant.
  loop = gsap.timeline({ repeat: -1, delay: FIRST_HOLD, repeatDelay: HOLD_DURATION })
  addMorph(loop, alt, text, 0)
  addMorph(loop, text, alt, `+=${HOLD_DURATION}`)
  if (!props.active) loop.pause()
})

// Le morph anime un filter: blur(), l'une des animations les plus coûteuses qui soient — le
// flou gaussien est entièrement recalculé à chaque frame, sans raccourci GPU. La laisser
// tourner pendant le reste de la page ampute le budget des transitions de section, ce qui se
// voit sur mobile. La reprise repart de l'endroit exact où la pause a eu lieu, donc aucune
// rupture visuelle au retour sur le hub.
watch(() => props.active, (active) => {
  if (!loop) return
  if (active) loop.resume()
  else loop.pause()
})

// Sortie et entrée démarrent exactement ensemble ('<') : c'est ce recouvrement des deux
// mots flous qui donne la déformation de l'un vers l'autre. Le scale complète le flou —
// le mot sortant s'éloigne (1.2) pendant que l'entrant se rapproche (0.8 → 1) —, sans
// quoi la transition se lit comme un simple fondu.
function addMorph(
  tl: gsap.core.Timeline,
  incoming: HTMLElement,
  outgoing: HTMLElement,
  position: gsap.Position,
) {
  tl.to(outgoing, {
    opacity: 0,
    filter: `blur(${MORPH_BLUR}px)`,
    scale: 1.2,
    duration: MORPH_DURATION,
    ease: MORPH_EASE,
  }, position)

  tl.fromTo(incoming, {
    opacity: 0,
    filter: `blur(${MORPH_BLUR}px)`,
    scale: 0.8,
  }, {
    opacity: 1,
    filter: 'blur(0px)',
    scale: 1,
    duration: MORPH_DURATION,
    ease: MORPH_EASE,
    // Sans ça, GSAP applique l'état "from" dès la construction du timeline (comportement
    // par défaut de fromTo) : le mot encore à l'écran serait masqué avant même son tour.
    immediateRender: false,
  }, '<')
}

// Le clignotement CSS pilote déjà opacity : on doit d'abord le couper (classe dédiée)
// avant de laisser GSAP animer cette même propriété, sinon les deux se contredisent.
function stopCursor() {
  cursorBlinking.value = false
  nextTick(() => {
    if (cursorRef.value) gsap.to(cursorRef.value, { opacity: 0, duration: 0.4, ease: 'power2.out' })
  })
}
</script>

<template>
  <div
    class="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-14 flex items-center gap-0.5 whitespace-nowrap text-sm font-medium text-slate-100/70"
  >
    <!-- Les deux mots occupent la même cellule de grille : ils se superposent tout en
         laissant la grille se dimensionner sur le plus large, donc rien ne bouge autour. -->
    <span class="grid text-xl text-slate-100 sm:text-2xl">
      <span ref="textRef" class="opacity-0 [grid-area:1/1] justify-self-center">développeur web</span>
      <span ref="altRef" aria-hidden="true" class="opacity-0 [grid-area:1/1] justify-self-center">fullstack junior</span>
    </span>
    <span
      ref="cursorRef"
      class="hub-role-cursor invisible"
      :class="{ 'hub-role-cursor--off': !cursorBlinking }"
      aria-hidden="true"
    >|</span>
  </div>
</template>

<style scoped>
.hub-role-cursor {
  animation: hub-role-blink 1s step-end infinite;
}

.hub-role-cursor--off {
  animation: none;
}

@keyframes hub-role-blink {
  50% {
    opacity: 0;
  }
}
</style>
