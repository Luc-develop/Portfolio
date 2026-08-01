<script setup lang="ts">
import { gsap } from 'gsap'

// last : le dernier panneau n'est jamais épinglé ni recouvert, donc rien ne justifie de
// l'enfermer dans une hauteur d'écran — son contenu excédentaire serait simplement coupé,
// alors que les autres le font défiler à l'intérieur avant de céder la place au suivant.
const props = withDefaults(
  defineProps<{ color: string, title: string, side?: 'left' | 'right', last?: boolean }>(),
  { side: 'left' },
)

const EDGE_COLOR = 'var(--accent-line)'
const EDGE_WIDTH = '8px'
const SLANT = '4rem'

// Le haut du panneau est progressivement transparent : le panneau précédent, encore
// visible derrière pendant qu'il rétrécit, apparaît au travers au lieu d'être coupé net.
// Le dégradé est posé sur un calque de fond dédié et non sur le panneau : un masque
// appliqué au panneau lui-même effacerait aussi le haut de son contenu.
const background = computed(
  () => `linear-gradient(to bottom, transparent, ${props.color} 20vh)`,
)

// La banderole est droite en bas et taillée en biais du côté opposé à son ancrage : à
// gauche c'est le bord droit qui file, à droite le bord gauche.
const outerClip = computed(() =>
  props.side === 'left'
    ? `polygon(0 0, 100% 0, calc(100% - ${SLANT}) 100%, 0 100%)`
    : `polygon(${SLANT} 0, 100% 0, 100% 100%, 0 100%)`,
)

// Même silhouette, décalée de l'épaisseur du liseré : le calque d accent dessous n'affleure
// alors que le long de la diagonale. Une bordure CSS ne pourrait pas suivre une découpe
// en clip-path, qui rogne l'élément après son rendu.
const innerClip = computed(() =>
  props.side === 'left'
    ? `polygon(0 0, calc(100% - ${EDGE_WIDTH}) 0, calc(100% - ${SLANT} - ${EDGE_WIDTH}) 100%, 0 100%)`
    : `polygon(calc(${SLANT} + ${EDGE_WIDTH}) 0, 100% 0, 100% 100%, ${EDGE_WIDTH} 100%)`,
)

// Pied de section : trapèze dont le bord haut est plus court que le bord bas, liseré d accent
// sur le haut et les deux côtés en biais. Le bas n'en a pas — il est collé au bord de la
// section, donc jamais visible. Même montage à deux calques que la banderole, mais un
// liseré plus fin : ici il court sur trois côtés et non sur une seule diagonale.
const FOOTER_EDGE = '2px'
const TAB_SLANT = '1.25rem'

const footerOuterClip = `polygon(${SLANT} 0, calc(100% - ${SLANT}) 0, 100% 100%, 0 100%)`
const footerInnerClip = `polygon(calc(${SLANT} + ${FOOTER_EDGE}) ${FOOTER_EDGE}, calc(100% - ${SLANT} - ${FOOTER_EDGE}) ${FOOTER_EDGE}, calc(100% - ${FOOTER_EDGE}) 100%, ${FOOTER_EDGE} 100%)`

// Même trapèze en réduction pour l'étiquette de titre, posée sur le pied : sa largeur est
// celle de son texte, son inclinaison est réduite en proportion.
const tabOuterClip = `polygon(${TAB_SLANT} 0, calc(100% - ${TAB_SLANT}) 0, 100% 100%, 0 100%)`
const tabInnerClip = `polygon(calc(${TAB_SLANT} + ${FOOTER_EDGE}) ${FOOTER_EDGE}, calc(100% - ${TAB_SLANT} - ${FOOTER_EDGE}) ${FOOTER_EDGE}, calc(100% - ${FOOTER_EDGE}) 100%, ${FOOTER_EDGE} 100%)`

const footerOpen = ref(false)
const footerRef = ref<HTMLElement | null>(null)
const tabHovered = ref(false)

// Les deux états ont le même nombre de fonctions, sinon la transition ne peut pas les
// interpoler et le changement se ferait d'un coup. Le second drop-shadow du repos est donc
// une couleur totalement transparente, qui ne se voit pas mais tient la place.
const TAB_SHADOW = 'drop-shadow(0 -6px 12px rgba(0,0,0,0.55)) drop-shadow(0 0 0 transparent)'
const TAB_GLOW = 'drop-shadow(0 0 8px var(--accent)) drop-shadow(0 0 20px var(--accent))'

let footerTween: gsap.core.Tween | undefined

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

onUnmounted(() => {
  footerTween?.kill()
})

function toggleFooter() {
  footerOpen.value = !footerOpen.value

  const el = footerRef.value
  if (!el) return

  // Une bascule pendant l'animation précédente reprend depuis la hauteur courante plutôt
  // que de repartir de zéro.
  footerTween?.kill()

  if (prefersReducedMotion()) {
    gsap.set(el, { height: footerOpen.value ? 'auto' : 0 })
    return
  }

  footerTween = gsap.to(el, {
    height: footerOpen.value ? 'auto' : 0,
    duration: footerOpen.value ? 0.45 : 0.35,
    ease: footerOpen.value ? 'power2.out' : 'power2.in',
  })
}
</script>

<template>
  <section
    class="panel relative text-slate-100"
    :class="last ? 'min-h-screen' : 'h-screen overflow-hidden'"
  >
    <div class="absolute inset-0" aria-hidden="true" :style="{ background }" />

    <div class="panel-inner relative min-h-full">
      <!-- drop-shadow et non box-shadow : seul le filtre épouse la silhouette découpée
           par clip-path, une box-shadow dessinerait l'ombre du rectangle d'origine. -->
      <div class="relative pt-16 sm:pt-20 [filter:drop-shadow(0_14px_22px_rgba(0,0,0,0.5))]">
        <div
          class="w-4/5 sm:w-2/3 lg:w-1/2"
          :class="side === 'right' ? 'ml-auto' : 'mr-auto'"
          :style="{ clipPath: outerClip, backgroundColor: EDGE_COLOR }"
        >
          <div
            class="bg-slate-900 py-8"
            :style="{ clipPath: innerClip }"
            :class="side === 'right'
              ? 'pl-24 pr-6 text-right sm:pr-10 lg:pr-16'
              : 'pl-6 pr-24 text-left sm:pl-10 lg:pl-16'"
          >
            <h2 class="text-3xl font-semibold uppercase tracking-[0.2em] sm:text-4xl lg:text-5xl">
              {{ title }}
            </h2>
          </div>
        </div>
      </div>

      <slot />
    </div>

    <!-- Hors de .panel-inner, ancré au bas du panneau : c'est la hauteur de .panel-inner
         qui règle le faux défilement, et son contenu est déplacé par un transform exprimé
         en pourcentage de cette hauteur. Un pied dépliable à l'intérieur ferait donc
         glisser toute la section à chaque frame de son animation. -->
    <!-- L'ombre est portée par l'étiquette et par le pied séparément, et non par ce
         conteneur : héritée d'ici, l'étiquette ne pourrait pas troquer son ombre noire
         contre un halo d accent au survol. -->
    <footer
      v-if="$slots.footer"
      class="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center"
    >
      <!-- Le halo passe par un filtre et non une box-shadow : clip-path rogne l'élément
           après son rendu, l'ombre serait découpée avec lui. -->
      <!-- L'ombre est portée par ce conteneur et non par la forme : clip-path s'applique
           après le filtre, une ombre posée sur l'élément découpé serait rognée avec lui et
           ne déborderait jamais. -->
      <div
        v-if="$slots['footer-title']"
        class="pointer-events-auto w-fit transition-[filter] duration-300"
        :style="{ filter: tabHovered ? TAB_GLOW : TAB_SHADOW }"
        @mouseenter="tabHovered = true"
        @mouseleave="tabHovered = false"
        @focusin="tabHovered = true"
        @focusout="tabHovered = false"
      >
        <h3
          class="group w-fit"
          :style="{ clipPath: tabOuterClip, backgroundColor: EDGE_COLOR }"
        >
          <button
            type="button"
            :aria-expanded="footerOpen"
            aria-controls="section-footer"
            class="flex items-center gap-3 bg-slate-900 px-12 pb-3 pt-4 text-xs uppercase
                   tracking-[0.2em] text-slate-100/60 transition-colors duration-300
                   group-hover:text-[var(--accent)]"
            :style="{ clipPath: tabInnerClip }"
            @click="toggleFooter"
          >
            <slot name="footer-title" />
            <svg
              viewBox="0 0 24 24"
              class="h-3.5 w-3.5 transition-transform duration-300"
              :class="footerOpen ? 'rotate-180' : ''"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </h3>
      </div>

      <!-- Replié par une classe et non par GSAP au montage : le serveur rend déjà la
           hauteur nulle, sinon le pied apparaîtrait déplié le temps d'une frame. -->
      <div
        id="section-footer"
        ref="footerRef"
        :aria-hidden="!footerOpen"
        class="pointer-events-auto h-0 w-4/5 overflow-hidden"
      >
        <div :style="{ clipPath: footerOuterClip, backgroundColor: EDGE_COLOR }">
          <!-- Le padding horizontal doit dépasser l'inclinaison, sinon le contenu du haut
               passe sous la découpe. -->
          <div
            class="bg-slate-900 px-20 pb-10 pt-12 text-center sm:px-24"
            :style="{ clipPath: footerInnerClip }"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </footer>
  </section>
</template>
