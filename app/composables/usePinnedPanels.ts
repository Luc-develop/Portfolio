import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function usePinnedPanels() {
  const activeIndex = ref(0)

  let root: HTMLElement | null = null
  let panels: HTMLElement[] = []
  let triggers: ScrollTrigger[] = []
  let progressTracker: ScrollTrigger | undefined
  let rebuildTimeout: ReturnType<typeof setTimeout> | undefined
  let viewportWidth = 0
  let viewportHeight = 0

  function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  function init(container: HTMLElement) {
    root = container
    build()

    // Les hauteurs sont mesurées une fois et servent à calculer une marge de faux
    // défilement : toute recomposition ultérieure la rend fausse et décale tous les
    // panneaux suivants. Un ScrollTrigger.refresh() ne suffit pas, il recalcule les
    // déclencheurs mais ni la marge ni la durée du tween — il faut tout reconstruire.
    document.fonts?.ready.then(rebuild)
    window.addEventListener('resize', onResize)
  }

  function build() {
    if (!root) return
    panels = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('.panel'))
    if (!panels.length) return

    viewportWidth = window.innerWidth
    viewportHeight = window.innerHeight

    if (!prefersReducedMotion()) {
      // Le dernier panneau n'est jamais épinglé : rien ne vient le recouvrir.
      panels.slice(0, -1).forEach(pinPanel)
    }

    progressTracker = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: self => updateActive(self.scroll()),
      onRefresh: self => updateActive(self.scroll()),
      snap: prefersReducedMotion()
        ? undefined
        : {
            snapTo: snapToPanel,
            duration: { min: 0.2, max: 0.5 },
            delay: 0.08,
            ease: 'power2.inOut',
          },
    })

    ScrollTrigger.refresh()
  }

  // La démolition retire les épinglages et les marges, la reconstruction les repose : sans
  // précaution, la page saute, puisque la hauteur du panneau a changé et que la même
  // position de défilement ne désigne plus le même endroit. On mémorise donc la distance
  // qui sépare la vue du sommet du panneau courant, et on la rétablit après coup — le tout
  // dans la même tâche, le navigateur ne peint que l'état final.
  function rebuild() {
    const index = activeIndex.value
    const offset = window.scrollY - panelScroll(index)

    teardown()
    build()

    window.scrollTo(0, Math.max(0, panelScroll(index) + offset))
  }

  // Sur mobile, l'apparition et la disparition de la barre d'URL font varier innerHeight
  // en permanence : reconstruire à chaque fois hacherait le défilement. Seul un vrai
  // changement de gabarit déclenche la reconstruction.
  function onResize() {
    const widthChanged = window.innerWidth !== viewportWidth
    const heightChanged = Math.abs(window.innerHeight - viewportHeight) > 120
    if (!widthChanged && !heightChanged) return

    clearTimeout(rebuildTimeout)
    rebuildTimeout = setTimeout(rebuild, 250)
  }

  function pinPanel(panel: HTMLElement) {
    const inner = panel.querySelector<HTMLElement>('.panel-inner')
    if (!inner) return

    const overflow = inner.offsetHeight - window.innerHeight

    // Proportion de l'animation consacrée au faux défilement du contenu interne. Le reste
    // (le 1 des durées ci-dessous : 0.9 de scale + 0.1 de fondu) sert au recouvrement par
    // le panneau suivant, qui doit toujours durer exactement une hauteur de fenêtre.
    const fakeScrollRatio = overflow > 0 ? overflow / (overflow + window.innerHeight) : 0

    // Marge équivalente au contenu qui dépasse : sans elle, le panneau suivant arriverait
    // avant que ce contenu ait fini de défiler.
    if (fakeScrollRatio) {
      panel.style.marginBottom = `${inner.offsetHeight * fakeScrollRatio}px`
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: panel,
        start: 'bottom bottom',
        end: () => (fakeScrollRatio ? `+=${inner.offsetHeight}` : 'bottom top'),
        pin: true,
        pinSpacing: false,
        scrub: true,
      },
    })

    if (fakeScrollRatio) {
      tl.to(inner, {
        yPercent: -100,
        y: window.innerHeight,
        duration: 1 / (1 - fakeScrollRatio) - 1,
        ease: 'none',
      })
    }

    tl.fromTo(panel, { scale: 1, opacity: 1 }, { scale: 0.7, opacity: 0.5, duration: 0.9 })
      .to(panel, { opacity: 0, duration: 0.1 })

    if (tl.scrollTrigger) triggers.push(tl.scrollTrigger)
  }

  // Position de défilement à laquelle le panneau remplit exactement la fenêtre. Chaque
  // panneau fait une hauteur d'écran, donc c'est le `start` de son propre trigger
  // ('bottom bottom'). offsetTop ne peut pas servir de référence : un panneau épinglé en
  // pinSpacing: false est retiré du flux, ce qui décale tous les suivants.
  function panelScroll(index: number): number {
    if (index <= 0) return 0
    if (!triggers.length) return panels[index]?.offsetTop ?? 0

    const trigger = triggers[index]
    if (trigger) return trigger.start

    // Dernier panneau : il n'a pas de trigger, sa position est la fin de celui du panneau
    // précédent — le moment où ce dernier a fini d'être recouvert. Compter une hauteur
    // d'écran après son début serait faux dès qu'il contient du faux défilement, puisque
    // sa course dure alors bien plus qu'une fenêtre.
    const previous = triggers[index - 1]
    return previous ? previous.end : 0
  }

  // Positions de repos : le sommet de chaque panneau, plus — pour ceux dont le contenu
  // dépasse la fenêtre — la fin de leur lecture, une fenêtre avant la fin de leur course.
  // Sans cette seconde cible, on ne peut pas s'arrêter en remontant depuis le panneau
  // suivant : la dernière fenêtre de la course est celle où le panneau se réduit et
  // s'efface, et le défilement se figeait en pleine mise à l'échelle.
  function snapTargets(): number[] {
    const targets = panels.map((_, index) => panelScroll(index))

    triggers.forEach((trigger) => {
      if (trigger.end - trigger.start > window.innerHeight + 1) {
        targets.push(trigger.end - window.innerHeight)
      }
    })

    return targets
  }

  // Cale le défilement libre sur les mêmes positions que la navigation par les carrés.
  // La conversion progression <-> défilement passe par les bornes du trigger lui-même
  // plutôt que par maxScroll : les panneaux épinglés étant retirés du flux, la hauteur du
  // document varie en cours de route et ne peut pas servir de référence stable.
  function snapToPanel(progress: number, self?: ScrollTrigger): number {
    if (!self) return progress
    const range = self.end - self.start
    if (range <= 0) return progress

    const scroll = self.start + progress * range
    let closest = scroll
    let distance = Number.POSITIVE_INFINITY

    snapTargets().forEach((raw) => {
      const target = Math.min(raw, self.end)
      const delta = Math.abs(scroll - target)
      if (delta < distance) {
        distance = delta
        closest = target
      }
    })

    // Aucun calage au milieu d'une zone de faux défilement (contenu plus haut que la
    // fenêtre) : ramener l'utilisateur au début ou à la fin de sa lecture serait pire que
    // de le laisser où il est.
    if (distance > window.innerHeight / 2) return progress

    return (closest - self.start) / range
  }

  // Bascule à mi-transition : le panneau entrant occupe alors déjà la majorité de l'écran.
  function updateActive(scroll: number) {
    let index = 0
    for (let i = 1; i < panels.length; i++) {
      if (scroll >= panelScroll(i) - window.innerHeight / 2) index = i
    }
    activeIndex.value = index
  }

  function scrollToPanel(index: number) {
    const target = panelScroll(index)

    if (prefersReducedMotion()) {
      window.scrollTo(0, target)
      return
    }

    gsap.to(window, {
      duration: 0.8,
      ease: 'power2.inOut',
      // autoKill: false — sans ça, le défilement déclenché par l'animation elle-même est
      // pris pour une intervention de l'utilisateur et interrompt le tween.
      scrollTo: { y: target, autoKill: false },
    })
  }

  function teardown() {
    triggers.forEach(trigger => trigger.kill())
    triggers = []
    progressTracker?.kill()
    progressTracker = undefined
    panels.forEach((panel) => {
      // Les marges et les transformations posées par le pin doivent partir avec les
      // triggers : reconstruire par-dessus mesurerait un DOM déjà déformé.
      panel.style.marginBottom = ''
      gsap.set(panel, { clearProps: 'transform,opacity' })
      const inner = panel.querySelector<HTMLElement>('.panel-inner')
      if (inner) gsap.set(inner, { clearProps: 'transform' })
    })
    panels = []
  }

  function destroy() {
    clearTimeout(rebuildTimeout)
    window.removeEventListener('resize', onResize)
    root = null
    teardown()
  }

  return { init, destroy, rebuild, scrollToPanel, activeIndex }
}
