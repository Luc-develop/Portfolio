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

// Pied de section : ancré au bord droit et centré verticalement, jamais au bord bas. Ce
// dernier est la grandeur la moins fiable d'une fenêtre mobile — la barre d'URL le recouvre,
// la mise à l'échelle du panneau le déplace, et vh ne s'accorde pas avec la hauteur réellement
// visible. Un ancrage latéral centré ne le référence pas du tout.
//
// Même montage à deux calques que la banderole, mais un liseré plus fin : le bord droit est
// collé au bord de la section, donc jamais visible, et le liseré ne court que sur les trois
// autres côtés.
const FOOTER_EDGE = '2px'
const TAB_SLANT = '1.25rem'

// Le panneau d'informations est un simple rectangle, à toutes les tailles : son liseré passe
// donc par une bordure CSS ordinaire, pas par un clip-path. Seul l'onglet garde le trapèze.
// Trapèze couché : le bord droit est plein, le bord gauche — celui qui fait face au contenu —
// est raccourci aux deux extrémités. Sa hauteur est celle de son texte, son inclinaison
// réduite en proportion.
const tabOuterClip = `polygon(0 ${TAB_SLANT}, 100% 0, 100% 100%, 0 calc(100% - ${TAB_SLANT}))`
const tabInnerClip = `polygon(${FOOTER_EDGE} calc(${TAB_SLANT} + ${FOOTER_EDGE}), 100% ${FOOTER_EDGE}, 100% calc(100% - ${FOOTER_EDGE}), ${FOOTER_EDGE} calc(100% - ${TAB_SLANT} - ${FOOTER_EDGE}))`

const footerOpen = ref(false)
const footerRef = ref<HTMLElement | null>(null)
const tabHovered = ref(false)

// Les deux états ont le même nombre de fonctions, sinon la transition ne peut pas les
// interpoler et le changement se ferait d'un coup. Le second drop-shadow du repos est donc
// une couleur totalement transparente, qui ne se voit pas mais tient la place.
const TAB_SHADOW = 'drop-shadow(-6px 0 12px rgba(0,0,0,0.55)) drop-shadow(0 0 0 transparent)'
const TAB_GLOW = 'drop-shadow(0 0 8px var(--accent)) drop-shadow(0 0 20px var(--accent))'

// Le halo signale un survol ou une navigation au clavier. Les deux événements qui l'allument
// se déclenchent aussi au toucher, où ils ne veulent rien dire et où rien ne vient les
// éteindre : les navigateurs mobiles émettent un mouseenter de synthèse sans mouseleave, et le
// bouton garde le focus après la fermeture du pied. Le halo restait donc allumé, et on le
// retrouvait tel quel en remontant.
function onTabEnter() {
  // Sur un appareil sans survol réel, l'événement est une synthèse du toucher : on l'ignore.
  if (window.matchMedia('(hover: hover)').matches) tabHovered.value = true
}

function onTabFocus(event: FocusEvent) {
  // :focus-visible ne vaut que pour la navigation au clavier — le seul cas où l'indication
  // sert à quelque chose. Un focus pris au clic ou au doigt ne l'obtient pas.
  tabHovered.value = (event.target as HTMLElement).matches(':focus-visible')
}

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

  // Une bascule pendant l'animation précédente reprend depuis la largeur courante plutôt
  // que de repartir de zéro.
  footerTween?.kill()

  // Le panneau coule depuis la droite : c'est sa largeur qu'on anime, le conteneur étant
  // ancré à droite, sa croissance se fait donc vers la gauche. Le contenu à l'intérieur garde
  // une largeur fixe, sinon il se recomposerait à chaque frame de l'ouverture.
  if (prefersReducedMotion()) {
    gsap.set(el, { width: footerOpen.value ? 'auto' : 0 })
    return
  }

  footerTween = gsap.to(el, {
    width: footerOpen.value ? 'auto' : 0,
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

    <!-- Hors de .panel-inner, ancré au panneau lui-même : c'est la hauteur de .panel-inner
         qui règle le faux défilement, et son contenu est déplacé par un transform exprimé
         en pourcentage de cette hauteur. Un pied dépliable à l'intérieur ferait donc
         glisser toute la section à chaque frame de son animation. -->
    <!-- L'ombre est portée par l'étiquette et par le pied séparément, et non par ce
         conteneur : héritée d'ici, l'étiquette ne pourrait pas troquer son ombre noire
         contre un halo d accent au survol. -->
    <!-- Ancré à droite et centré verticalement : le bord bas n'intervient nulle part. Sur
         mobile il est recouvert par la barre d'URL, déplacé par la mise à l'échelle du panneau,
         et vh ne s'accorde pas avec la hauteur réellement visible — s'y référer était la cause
         de l'onglet qui flottait. Le conteneur étant ancré à droite, le panneau qui s'ouvre
         croît vers la gauche. -->
    <footer
      v-if="$slots.footer"
      class="pointer-events-none absolute inset-y-0 right-0 z-10 flex items-center"
    >
      <!-- Le halo passe par un filtre et non une box-shadow : clip-path rogne l'élément
           après son rendu, l'ombre serait découpée avec lui. -->
      <!-- L'ombre est portée par ce conteneur et non par la forme : clip-path s'applique
           après le filtre, une ombre posée sur l'élément découpé serait rognée avec lui et
           ne déborderait jamais. -->
      <div
        v-if="$slots['footer-title']"
        class="pointer-events-auto transition-[filter] duration-300"
        :style="{ filter: tabHovered ? TAB_GLOW : TAB_SHADOW }"
        @mouseenter="onTabEnter"
        @mouseleave="tabHovered = false"
        @focusin="onTabFocus"
        @focusout="tabHovered = false"
      >
        <h3
          class="group"
          :style="{ clipPath: tabOuterClip, backgroundColor: EDGE_COLOR }"
        >
          <!-- writing-mode vertical : en rangée verticale, flex-direction row suit l'axe
               d'écriture, donc le chevron se place sous le texte sans changer de direction. -->
          <button
            type="button"
            :aria-expanded="footerOpen"
            aria-controls="section-footer"
            class="flex items-center gap-3 bg-slate-900 py-12 pl-4 pr-3 text-xs uppercase
                   tracking-[0.2em] text-slate-100/60 transition-colors duration-300
                   [writing-mode:vertical-rl] group-hover:text-[var(--accent)]"
            :style="{ clipPath: tabInnerClip }"
            @click="toggleFooter"
          >
            <slot name="footer-title" />
            <!-- Le chevron pointe vers l'intérieur au repos, vers le bord une fois ouvert :
                 il indique le sens dans lequel le panneau va se déplacer. -->
            <svg
              viewBox="0 0 24 24"
              class="h-3.5 w-3.5 transition-transform duration-300"
              :class="footerOpen ? '-rotate-90' : 'rotate-90'"
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

      <!-- Le panneau suit l'onglet dans le document : la rangée étant ancrée à droite, son
           bord droit est donc collé au bord de l'écran, et sa croissance repousse l'onglet vers
           la gauche au lieu de s'ouvrir derrière lui. -->
      <!-- Replié par une classe et non par GSAP au montage : le serveur rend déjà la
           largeur nulle, sinon le pied apparaîtrait déplié le temps d'une frame. -->
      <div
        id="section-footer"
        ref="footerRef"
        :aria-hidden="!footerOpen"
        class="pointer-events-auto flex w-0 justify-end overflow-hidden"
      >
        <!-- justify-end sur le parent et shrink-0 ici : le contenu garde sa largeur pleine et
             reste collé au bord droit pendant que la largeur du conteneur s'anime. C'est ce qui
             le fait apparaître en glissant depuis le bord de l'écran, plutôt que de se
             recomposer à chaque frame de l'ouverture. -->
        <div
          class="w-[85vw] max-w-[32rem] shrink-0 border-y-2 border-l-2 bg-slate-900
                 px-6 py-8 sm:px-10 sm:py-10"
          :style="{ borderColor: EDGE_COLOR }"
        >
          <slot name="footer" />
        </div>
      </div>
    </footer>
  </section>
</template>
