import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { Flip } from 'gsap/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

// Enregistrement unique côté client : évite que le bundler élimine le plugin par tree-shaking
export default defineNuxtPlugin(() => {
  gsap.registerPlugin(SplitText, MorphSVGPlugin, Flip, ScrollTrigger, ScrollToPlugin)

  // Sur mobile, ScrollTrigger recalcule ses bornes à chaque variation de hauteur de fenêtre :
  // barre d'URL qui se replie, et surtout clavier virtuel qui s'ouvre. Le recalcul déplace le
  // défilement sous le doigt en pleine saisie. Cette option lui fait ignorer les
  // redimensionnements purement verticaux sur appareil tactile.
  ScrollTrigger.config({ ignoreMobileResize: true })
})
