import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { Flip } from 'gsap/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

// Enregistrement unique côté client : évite que le bundler élimine le plugin par tree-shaking
export default defineNuxtPlugin(() => {
  gsap.registerPlugin(SplitText, MorphSVGPlugin, Flip, ScrollTrigger, ScrollToPlugin)
})
