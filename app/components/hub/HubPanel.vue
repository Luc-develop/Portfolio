<script setup lang="ts">
import { useHubIntro } from '~/composables/useHubIntro'

// active : transmis à HubRole, dont la boucle de morph doit s'arrêter dès que le hub cède
// la place à la section suivante.
withDefaults(defineProps<{ active?: boolean }>(), { active: true })

const emit = defineEmits<{ introEnd: [], chromeReady: [] }>()

const panelRef = ref<HTMLElement | null>(null)
const introPlaying = ref(true)
const chromeReady = ref(false)
const { playIntro } = useHubIntro()

onMounted(async () => {
  if (panelRef.value) {
    // Le rappel se déclenche au début de la frappe du rôle, pas à la fin de l'intro : les
    // éléments de navigation se posent pendant que le mot s'écrit, au lieu de surgir tous
    // ensemble une fois le centre terminé.
    await playIntro(panelRef.value, () => {
      chromeReady.value = true
      emit('chromeReady')
    })
  }
  introPlaying.value = false
  emit('introEnd')
})
</script>

<template>
  <section ref="panelRef" class="panel relative h-screen overflow-hidden bg-slate-900">
    <HubAvailability :active="chromeReady" />

    <div class="panel-inner flex min-h-full items-center justify-center">
      <HubIntro v-if="introPlaying" />
      <div class="relative w-px h-px">
        <HubCore />
        <HubRole :morph="!introPlaying" :active="active" />
      </div>
    </div>
  </section>
</template>
