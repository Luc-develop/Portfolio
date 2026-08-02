import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { Flip } from 'gsap/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

// Enregistrement unique côté client : évite que le bundler élimine le plugin par tree-shaking
export default defineNuxtPlugin(() => {
  gsap.registerPlugin(SplitText, MorphSVGPlugin, Flip, ScrollTrigger, ScrollToPlugin)

  // Sur mobile, ScrollTrigger recalcule ses bornes à chaque variation de hauteur de fenêtre.
  // La barre d'URL n'est plus en cause depuis normalizeScroll (usePinnedPanels), qui la fige,
  // mais le clavier virtuel si : la normalisation est justement suspendue pendant la saisie
  // pour laisser le navigateur dégager le champ, et c'est cette option qui empêche alors le
  // recalcul de déplacer le défilement sous le doigt.
  ScrollTrigger.config({ ignoreMobileResize: true })
})
