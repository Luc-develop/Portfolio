<script setup lang="ts">
import type { StackItem } from '~/data/stack'

defineProps<{ item: StackItem }>()

// Le survol suffit à la souris, mais il n'existe pas au toucher : le clic bascule aussi la
// carte, et l'état explicite l'emporte alors sur le survol.
const flipped = ref(false)
</script>

<template>
  <button
    type="button"
    class="tech-card group h-36 w-full [perspective:800px]"
    :style="{ '--tech-color': item.color }"
    :aria-pressed="flipped"
    @click="flipped = !flipped"
  >
    <span
      class="tech-card-inner relative block h-full w-full [transform-style:preserve-3d]"
      :class="flipped ? 'is-flipped' : ''"
    >
      <span class="tech-face flex-col gap-2">
        <svg
          viewBox="0 0 24 24"
          class="h-12 w-12 shrink-0"
          :style="{ color: item.color }"
          fill="currentColor"
          aria-hidden="true"
        >
          <path :d="item.path" />
        </svg>
        <span class="text-[13px] font-medium leading-none">{{ item.name }}</span>
      </span>

      <span class="tech-face tech-face--back px-4 text-center text-[13px] leading-snug text-slate-100/80">
        {{ item.reason }}
      </span>
    </span>
  </button>
</template>

<style scoped>
/* Angle enregistré comme propriété typée : sans @property, un dégradé conique n'est pas
   interpolable et la bordure sauterait au lieu de tourner. */
@property --tech-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.tech-card-inner {
  transition: transform 500ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Le survol ne pilote le retournement que sur un appareil qui sait réellement survoler.
   Au toucher, l'état :hover reste collé à l'élément tapé : la carte restait retournée
   malgré un second clic, et ne se libérait qu'en tapant sur une autre. */
@media (hover: hover) and (pointer: fine) {
  .tech-card:hover .tech-card-inner {
    transform: rotateY(180deg);
  }
}

.tech-card:focus-visible .tech-card-inner,
.tech-card-inner.is-flipped {
  transform: rotateY(180deg);
}

/* Bordure en dégradé : la couleur de fond occupe la padding-box, le dégradé la border-box,
   et la bordure transparente laisse voir ce dernier. L'arc tourne dans la couleur du logo,
   le reste du tour restant transparent pour que le trait reste un reflet et non un cadre. */
.tech-face {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  border: 1px solid transparent;
  backface-visibility: hidden;
  background:
    linear-gradient(var(--tech-surface), var(--tech-surface)) padding-box,
    conic-gradient(
      from var(--tech-angle),
      transparent 0deg,
      var(--tech-color) 60deg,
      transparent 140deg,
      transparent 360deg
    ) border-box;
  animation: tech-border 6s linear infinite;
}

.tech-face--back {
  transform: rotateY(180deg);
}

@keyframes tech-border {
  to {
    --tech-angle: 360deg;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tech-face {
    animation: none;
  }

  .tech-card-inner {
    transition: none;
  }
}
</style>
