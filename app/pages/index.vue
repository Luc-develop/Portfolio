<script setup lang="ts">
import { usePinnedPanels } from '~/composables/usePinnedPanels'

const panelsRef = ref<HTMLElement | null>(null)
const introPlaying = ref(true)
// Les éléments de navigation se posent pendant la frappe du rôle, pas à la fin de
// l'intro : mis en place au même instant, ils surgissaient tous ensemble.
const chromeReady = ref(false)
const { init, destroy, scrollToPanel, activeIndex } = usePinnedPanels()
const { accentVars } = useSectionPalette()

// Le défilement est bloqué pendant l'intro : sinon les ScrollTrigger se déclenchent
// pendant que le logo morphe, et le panneau d'accueil s'efface avant d'être vu.
onMounted(() => {
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = ''
  destroy()
})

async function onIntroEnd() {
  introPlaying.value = false
  document.body.style.overflow = ''
  // Les panneaux ne sont mesurés qu'une fois le tiroir rendu et l'intro retirée du DOM.
  await nextTick()
  if (panelsRef.value) init(panelsRef.value)
}
</script>

<template>
  <div :style="accentVars">
    <div ref="panelsRef">
      <HubPanel @chrome-ready="chromeReady = true" @intro-end="onIntroEnd" />
      <AboutSection />
      <ProjectsSection />
      <ContactSection />
    </div>

    <!-- Hors du conteneur de panneaux : ScrollTrigger applique un transform sur chacun
         d'eux, et un ancêtre transformé devient le référentiel des position: fixed de ses
         descendants — le tiroir serait alors scalé et fondu avec le panneau d'accueil. -->
    <HubSquaresDrawer
      v-if="chromeReady"
      :active-panel="activeIndex"
      @select="scrollToPanel"
    />

    <!-- Apparaît dès qu'on quitte le hub, c'est-à-dire à l'arrivée sur la première section. -->
    <BackToHub
      v-if="chromeReady"
      :visible="activeIndex > 0"
      @select="scrollToPanel(0)"
    />
  </div>
</template>
