<script setup lang="ts">
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'

const props = defineProps<{ active?: boolean }>()

const rootRef = ref<HTMLElement | null>(null)
const textRef = ref<HTMLElement | null>(null)
const dotRef = ref<HTMLElement | null>(null)
const haloRef = ref<HTMLElement | null>(null)

let split: SplitText | undefined
let pulse: gsap.core.Timeline | undefined

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

onMounted(() => {
  if (!textRef.value) return
  split = SplitText.create(textRef.value, { type: 'chars' })
  // Même précaution que pour le rôle : le conteneur devient visible et ce sont les lettres
  // qui sont masquées, sinon le mot entier apparaîtrait d'un bloc avant la frappe.
  gsap.set(textRef.value, { opacity: 1 })
  gsap.set(split.chars, { opacity: 0 })
  // La capsule entière est masquée, pas seulement son contenu : sinon son fond et son
  // liseré flottent, vides, pendant toute l'intro.
  gsap.set([rootRef.value, dotRef.value, haloRef.value], { autoAlpha: 0 })
})

onUnmounted(() => {
  pulse?.kill()
  split?.revert()
})

watch(() => props.active, (on) => {
  if (!on || !split || pulse) return

  if (prefersReducedMotion()) {
    gsap.set(split.chars, { opacity: 1 })
    gsap.set([rootRef.value, dotRef.value], { autoAlpha: 1, scale: 1 })
    return
  }

  gsap.timeline()
    .to(rootRef.value, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' })
    .fromTo(dotRef.value, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, '-=0.1')
    // Apparition quasi instantanée lettre par lettre : la sensation de frappe vient de
    // l'échelonnement, pas d'une animation sur chaque caractère.
    .to(split.chars, { opacity: 1, duration: 0.01, stagger: 0.045 }, '-=0.1')
    .call(startPulse)
})

// Le halo est un second disque, distinct du point : lui faire enfler le point même le
// ferait battre le texte à côté, puisque tout est aligné sur une même ligne.
function startPulse() {
  pulse = gsap.timeline({ repeat: -1 })
    .set(haloRef.value, { autoAlpha: 0.6, scale: 1 })
    .to(haloRef.value, { scale: 2.6, autoAlpha: 0, duration: 1.4, ease: 'power2.out' })
    .to(dotRef.value, { opacity: 0.35, duration: 0.7, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0)
    .to({}, { duration: 0.6 })
}
</script>

<template>
  <div
    ref="rootRef"
    class="invisible absolute right-10 top-10 z-20 flex items-center gap-3 rounded-full
           bg-slate-900/90 px-4 py-2 ring-1 ring-inset ring-[color:var(--accent)]/30"
  >
    <span class="relative flex h-2.5 w-2.5 items-center justify-center">
      <span ref="haloRef" class="absolute h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
      <span ref="dotRef" class="relative h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
    </span>
    <span ref="textRef" class="text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)] opacity-0">
      Disponible
    </span>
  </div>
</template>
