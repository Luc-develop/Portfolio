<script setup lang="ts">
import { findStackItem } from '~/data/stack'

const props = defineProps<{ techKey: string }>()

const item = computed(() => findStackItem(props.techKey))
</script>

<template>
  <span
    v-if="item"
    class="tech-badge inline-block rounded-full px-3 py-1 text-xs font-medium"
    :style="{ color: item.color, '--badge-color': item.color }"
  >
    {{ item.name }}
  </span>
</template>

<style scoped>
@property --badge-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

/* Même montage que les cartes de technos : le fond occupe la padding-box, le dégradé la
   border-box, et la bordure transparente le laisse voir. */
.tech-badge {
  border: 1px solid transparent;
  background:
    linear-gradient(#0f172a, #0f172a) padding-box,
    conic-gradient(
      from var(--badge-angle),
      transparent 0deg,
      var(--badge-color) 60deg,
      transparent 140deg,
      transparent 360deg
    ) border-box;
  animation: badge-border 6s linear infinite;
}

@keyframes badge-border {
  to {
    --badge-angle: 360deg;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tech-badge {
    animation: none;
  }
}
</style>
