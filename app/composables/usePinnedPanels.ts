import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function usePinnedPanels() {
  const activeIndex = ref(0)

  let root: HTMLElement | null = null
  let panels: HTMLElement[] = []
  let triggers: ScrollTrigger[] = []
  let progressTracker: ScrollTrigger | undefined
  let rebuildTimeout: ReturnType<typeof setTimeout> | undefined
  let normalizer: ReturnType<typeof ScrollTrigger.normalizeScroll> | undefined
  let refocusTimeout: ReturnType<typeof setTimeout> | undefined
  let viewportWidth = 0
  let viewportHeight = 0

  // Délai avant calage. C'est le seul réglage de confort : un délai court le faisait
  // intervenir en pleine inertie du défilement tactile, où il se lisait comme une reprise en
  // main. L'allonger le réserve aux vrais arrêts.
  const SNAP_DELAY = 0.3

  // Rayon d'attraction du calage, en fraction de hauteur de fenêtre : au-delà, on est laissé
  // où l'on est. C'est LE réglage de l'amplitude du calage — l'augmenter le rend plus
  // rattrapant et ses corrections plus longues, le diminuer le rend plus discret au prix de
  // pouvoir s'arrêter en plein recouvrement, sur un panneau à échelle intermédiaire.
  const SNAP_ZONE = 0.15

  function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  // Le clavier virtuel réduit la fenêtre exactement comme un changement de gabarit, et le
  // navigateur fait défiler la page pour dégager le champ qu'on vient de toucher. Reconstruire
  // ou caler à ce moment-là écraserait ce défilement, et le champ repasserait sous le clavier.
  // Un champ éditable au focus est le seul signal fiable : iOS ne redimensionne pas la fenêtre
  // et n'expose donc rien d'autre à observer.
  function isEditingField(): boolean {
    const el = document.activeElement
    if (!el) return false
    return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'
      || (el as HTMLElement).isContentEditable
  }

  // Le défilement tactile natif est traité par le thread compositeur, tandis que l'épinglage
  // (position: fixed) et le tween en scrub vivent sur le thread principal, en retard d'une ou
  // deux frames pendant un scroll au doigt : le panneau épinglé glisse derrière le reste de la
  // page. Aucune optimisation de peint ne rattrape ça, c'est un défaut de synchronisation.
  // GSAP reprend donc le défilement pour le piloter depuis le thread de l'animation.
  //
  // Réservé aux appareils purement tactiles : sur un desktop à écran tactile (isTouch vaut 2)
  // on détournerait aussi la molette, qui n'a pas ce problème. type: 'touch' l'exclut de toute
  // façon, la double garde évite juste d'installer un observateur pour rien.
  function normalizeTouchScroll() {
    if (ScrollTrigger.isTouch !== 1) return

    normalizer = ScrollTrigger.normalizeScroll({
      type: 'touch',
      allowNestedScroll: true,
    })
  }

  // Pendant la saisie, on rend la main au navigateur : c'est lui qui fait remonter le champ
  // au-dessus du clavier, et il ne peut pas le faire tant que GSAP tient la position de
  // défilement.
  function onFocusIn() {
    if (isEditingField()) normalizer?.disable()
  }

  function onFocusOut() {
    // focusout précède la prise de focus suivante : sans ce report, passer d'un champ à
    // l'autre réactiverait la normalisation entre les deux.
    clearTimeout(refocusTimeout)
    refocusTimeout = setTimeout(() => {
      if (!isEditingField()) normalizer?.enable()
    }, 0)
  }

  function init(container: HTMLElement) {
    root = container
    build()
    normalizeTouchScroll()

    // Les hauteurs sont mesurées une fois et servent à calculer une marge de faux
    // défilement : toute recomposition ultérieure la rend fausse et décale tous les
    // panneaux suivants. Un ScrollTrigger.refresh() ne suffit pas, il recalcule les
    // déclencheurs mais ni la marge ni la durée du tween — il faut tout reconstruire.
    //
    // Encore faut-il qu'une police soit réellement en vol : sinon la promesse est déjà tenue
    // et se résout à la micro-tâche suivante, si bien qu'on refaisait une construction
    // complète, reflow compris, quelques millisecondes après la première — à l'instant précis
    // où l'intro se termine, donc au moment le plus visible de la page.
    if (document.fonts && document.fonts.status !== 'loaded') {
      document.fonts.ready.then(rebuild)
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('focusin', onFocusIn)
    window.addEventListener('focusout', onFocusOut)
  }

  function build() {
    if (!root) return
    panels = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('.panel'))
    if (!panels.length) return

    viewportWidth = window.innerWidth
    viewportHeight = window.innerHeight

    if (!prefersReducedMotion()) {
      // Le dernier panneau n'est jamais épinglé : rien ne vient le recouvrir.
      const pinned = panels.slice(0, -1)

      // Toutes les mesures d'abord, toutes les écritures ensuite. En alternant lecture de
      // offsetHeight et pose de marginBottom, chaque panneau forçait le navigateur à
      // recalculer la mise en page du document entier avant de répondre — autant de reflows
      // complets que de panneaux, sur une page qui en fait plusieurs écrans de haut. C'est la
      // part la plus lourde du démarrage sur mobile.
      const innerHeights = pinned.map(
        panel => panel.querySelector<HTMLElement>('.panel-inner')?.offsetHeight ?? 0,
      )

      pinned.forEach((panel, index) => pinPanel(panel, innerHeights[index] ?? 0))
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
            delay: SNAP_DELAY,
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
    // La hauteur de référence n'est pas mise à jour ici : à la fermeture du clavier, la
    // fenêtre retrouve sa taille d'origine et l'événement suivant ne constate aucun écart.
    if (isEditingField()) return

    const widthChanged = window.innerWidth !== viewportWidth
    const heightChanged = Math.abs(window.innerHeight - viewportHeight) > 120
    if (!widthChanged && !heightChanged) return

    clearTimeout(rebuildTimeout)
    rebuildTimeout = setTimeout(rebuild, 250)
  }

  // innerHeight est mesurée par l'appelant, en même temps que celle des autres panneaux :
  // la lire ici, entre deux écritures de style, coûterait un reflow par panneau.
  function setLayerPromotion(panel: HTMLElement, active: boolean) {
    panel.style.willChange = active ? 'transform, opacity' : ''
  }

  function pinPanel(panel: HTMLElement, innerHeight: number) {
    const inner = panel.querySelector<HTMLElement>('.panel-inner')
    if (!inner) return

    const overflow = innerHeight - window.innerHeight

    // Proportion de l'animation consacrée au faux défilement du contenu interne. Le reste
    // (le 1 des durées ci-dessous : 0.9 de scale + 0.1 de fondu) sert au recouvrement par
    // le panneau suivant, qui doit toujours durer exactement une hauteur de fenêtre.
    const fakeScrollRatio = overflow > 0 ? overflow / (overflow + window.innerHeight) : 0

    // Marge équivalente au contenu qui dépasse : sans elle, le panneau suivant arriverait
    // avant que ce contenu ait fini de défiler.
    if (fakeScrollRatio) {
      panel.style.marginBottom = `${innerHeight * fakeScrollRatio}px`
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: panel,
        start: 'bottom bottom',
        // Relu à chaque refresh, et non figé à la mesure du montage : le contenu peut avoir
        // changé de hauteur entre-temps. Un refresh est rare, il ne s'agit pas d'un coût
        // par frame.
        end: () => (fakeScrollRatio ? `+=${inner.offsetHeight}` : 'bottom top'),
        pin: true,
        pinSpacing: false,
        scrub: true,
        // Sans cette annonce, Chrome rastérise à nouveau le panneau à chaque valeur de scale.
        // Comme il contient un drop-shadow, deux clip-path imbriqués et un dégradé à
        // transparence, ce repeint dure plus qu'une frame sur mobile : c'est ce qui hache la
        // transition. Promu en calque, il n'est peint qu'une fois, le compositeur se
        // contentant ensuite de le redimensionner et de le fondre.
        // Posé et retiré au fil de la course du trigger : garder en permanence trois calques
        // plein écran coûterait trop de mémoire vidéo sur un téléphone.
        onToggle: self => setLayerPromotion(panel, self.isActive),
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

    // Instant où le recouvrement commence : tout ce qui précède est du faux défilement, où le
    // panneau reste à l'échelle 1.
    const coverStart = tl.duration()

    tl.fromTo(panel, { scale: 1, opacity: 1 }, { scale: 0.7, opacity: 0.5, duration: 0.9 })
      .to(panel, { opacity: 0, duration: 0.1 })

    // Le pied est ancré au bord bas du panneau. Dès que celui-ci rétrécit, ce bord remonte et
    // l'onglet décolle du bas de l'écran — d'autant plus visible qu'on peut s'immobiliser en
    // plein recouvrement, le calage ne rattrapant que ce qui est proche d'une borne. On le
    // retire donc à l'instant où l'échelle commence à bouger, au lieu de le laisser flotter.
    // Piloté par le scrub comme le reste : il revient de lui-même en remontant, et aucun état
    // ne subsiste d'un passage à l'autre.
    const footer = panel.querySelector<HTMLElement>('footer')
    if (footer) {
      tl.to(footer, { autoAlpha: 0, duration: 0.08 }, coverStart)
    }

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

  // Le recouvrement d'un panneau par le suivant occupe toujours exactement la dernière hauteur
  // de fenêtre de la course de son trigger — c'est ainsi que pinPanel dose la part de faux
  // défilement. C'est le seul intervalle où le panneau est à une échelle intermédiaire, donc
  // le seul où s'immobiliser produit un écran incohérent : un panneau rétréci, et tout ce qui
  // est ancré à son bord bas décollé de l'écran.
  function isCoveringZone(scroll: number): boolean {
    return triggers.some(
      trigger => scroll > trigger.end - window.innerHeight && scroll < trigger.end,
    )
  }

  // Cale le défilement libre sur les mêmes positions que la navigation par les carrés.
  // La conversion progression <-> défilement passe par les bornes du trigger lui-même
  // plutôt que par maxScroll : les panneaux épinglés étant retirés du flux, la hauteur du
  // document varie en cours de route et ne peut pas servir de référence stable.
  function snapToPanel(progress: number, self?: ScrollTrigger): number {
    if (!self || isEditingField()) return progress
    const range = self.end - self.start
    if (range <= 0) return progress

    const scroll = self.start + progress * range

    // Hors d'un recouvrement, on ne touche à rien. C'est le cas du faux défilement d'un
    // contenu plus haut que la fenêtre : le panneau y est à l'échelle 1, l'utilisateur lit, et
    // le ramener au début ou à la fin de sa lecture serait pire que de le laisser où il est.
    if (!isCoveringZone(scroll)) return progress

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

    // Le calage ne rattrape que ce qui est déjà proche d'une borne. Plus loin, il faudrait
    // parcourir une distance que l'utilisateur n'a pas demandée, et ça se lit comme une reprise
    // en main du défilement.
    if (distance > window.innerHeight * SNAP_ZONE) return progress

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
      setLayerPromotion(panel, false)
      gsap.set(panel, { clearProps: 'transform,opacity' })
      const inner = panel.querySelector<HTMLElement>('.panel-inner')
      if (inner) gsap.set(inner, { clearProps: 'transform' })
      // Sans ça, un pied masqué au moment de la reconstruction le resterait : le nouveau
      // timeline part de l'état courant du DOM.
      const footer = panel.querySelector<HTMLElement>('footer')
      if (footer) gsap.set(footer, { clearProps: 'opacity,visibility' })
    })
    panels = []
  }

  function destroy() {
    clearTimeout(rebuildTimeout)
    clearTimeout(refocusTimeout)
    window.removeEventListener('resize', onResize)
    window.removeEventListener('focusin', onFocusIn)
    window.removeEventListener('focusout', onFocusOut)
    // kill et non disable : la normalisation remplace le défilement natif du document, la
    // laisser en place survivrait à la page.
    normalizer?.kill()
    normalizer = undefined
    root = null
    teardown()
  }

  return { init, destroy, rebuild, scrollToPanel, activeIndex }
}
