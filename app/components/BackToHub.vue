<script setup lang="ts">
import { gsap } from 'gsap'

const props = defineProps<{ visible: boolean }>()

const emit = defineEmits<{ select: [] }>()

const buttonRef = ref<HTMLElement | null>(null)
const iconRef = ref<HTMLElement | null>(null)

let bounce: gsap.core.Tween | undefined

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

onMounted(() => {
  if (!buttonRef.value) return
  // autoAlpha plutôt qu'opacity : il pose aussi visibility: hidden, ce qui sort le bouton
  // de l'ordre de tabulation tant qu'il n'est pas affiché.
  gsap.set(buttonRef.value, { autoAlpha: 0, y: 20 })

  // Le rebond porte sur l'icône et non sur le bouton : celui-ci a déjà son propre tween
  // d'entrée/sortie sur y, les deux se battraient pour la même propriété.
  if (!prefersReducedMotion() && iconRef.value) {
    bounce = gsap.to(iconRef.value, {
      y: -4,
      duration: 0.8,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    })
  }
})

onUnmounted(() => {
  bounce?.kill()
})

watch(() => props.visible, (visible) => {
  const button = buttonRef.value
  if (!button) return

  gsap.killTweensOf(button)

  if (prefersReducedMotion()) {
    gsap.set(button, { autoAlpha: visible ? 1 : 0, y: 0 })
    return
  }

  gsap.to(button, visible
    ? { autoAlpha: 1, y: 0, duration: 0.5, ease: 'back.out(1.6)' }
    : { autoAlpha: 0, y: 20, duration: 0.3, ease: 'power2.in' })
})
</script>

<template>
  <button
    ref="buttonRef"
    type="button"
    aria-label="Revenir à l'accueil"
    class="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center
           rounded-full bg-slate-900 text-slate-100 shadow-lg
           ring-1 ring-inset ring-slate-100/20
           transition-[box-shadow] duration-300 hover:ring-slate-100/50"
    @click="emit('select')"
  >
    <span ref="iconRef" class="block">
      <svg
        viewBox="0 0 24 24"
        class="h-5 w-5"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </span>
  </button>
</template>
