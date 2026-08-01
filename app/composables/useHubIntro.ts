import { gsap } from 'gsap'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { LOGO_PATH_D } from '~/components/hub/hubLogoPath'

export function useHubIntro() {
  function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  function playIntro(container: HTMLElement, onRoleReveal?: () => void): Promise<void> {
    const particles = container.querySelectorAll<HTMLElement>('.hub-particle')
    const core = container.querySelectorAll<HTMLElement>('.hub-core')
    const roleChars = container.querySelectorAll<HTMLElement>('.hub-role-char')
    const roleCursor = container.querySelectorAll<HTMLElement>('.hub-role-cursor')

    // convertToPath() remplace le <circle> par un <path> dans le DOM et renvoie les
    // nouveaux éléments : on doit utiliser cette valeur de retour pour la suite (une
    // NodeList capturée avant l'appel pointerait vers un nœud retiré du DOM). Fait une
    // fois, en amont du timeline, car la conversion ne change rien au rendu (un cercle
    // en <path> est visuellement identique) — seul le tween morphSVG doit être calé
    // dans l'animation.
    const coreShape = MorphSVGPlugin.convertToPath(
      Array.from(container.querySelectorAll<SVGCircleElement>('.hub-core-shape')),
    )

    if (prefersReducedMotion()) {
      gsap.set(particles, { opacity: 0 })
      gsap.set(core, { opacity: 1, scale: 1 })
      gsap.set(coreShape, { morphSVG: LOGO_PATH_D })
      gsap.set(roleChars, { opacity: 1 })
      gsap.set(roleCursor, { visibility: 'visible' })
      onRoleReveal?.()
      return Promise.resolve()
    }

    gsap.set(core, { scale: 0.5 })

    return new Promise((resolve) => {
      gsap.timeline({ onComplete: resolve })
        .to(particles, {
          x: 0,
          y: 0,
          opacity: 0,
          scale: 0.2,
          duration: 0.7,
          ease: 'power2.in',
          stagger: 0.03,
        })
        .to(core, {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: 'back.out(1.7)',
        }, '-=0.2')
        .to(coreShape, {
          morphSVG: LOGO_PATH_D,
          duration: 0.8,
          ease: 'power2.inOut',
        })
        // Point de synchronisation avec le timeline (indépendant) des carrés : ils
        // doivent démarrer exactement quand "développeur" commence à s'écrire.
        .call(() => onRoleReveal?.())
        .to(roleChars, {
          opacity: 1,
          duration: 0.01,
          stagger: 0.045,
        })
        // Le curseur reste masqué (visibility, pas opacity — l'animation CSS de
        // clignotement pilote déjà opacity, un conflit s'ensuivrait) tant que la frappe
        // n'est pas terminée ; il apparaît d'un coup juste après, puis clignote en continu.
        .set(roleCursor, { visibility: 'visible' })
    })
  }

  return { playIntro, prefersReducedMotion }
}
