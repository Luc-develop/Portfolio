<script setup lang="ts">
const particleOffsets = [
  { x: -140, y: -80 }, { x: 120, y: -100 }, { x: -160, y: 40 }, { x: 150, y: 60 },
  { x: -80, y: 130 }, { x: 90, y: 140 }, { x: -40, y: -150 }, { x: 40, y: 150 },
]
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-0">
    <div
      v-for="(offset, index) in particleOffsets"
      :key="index"
      class="hub-particle absolute left-1/2 top-1/2 w-2 h-2 rounded-full bg-slate-100/70"
      :style="{ transform: `translate(${offset.x}px, ${offset.y}px)` }"
    />
  </div>
</template>
