import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'

export function useHubSquaresDrawer() {
  function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  // État fermé hors écran, posé par GSAP (jamais par une classe Tailwind) : xPercent et
  // opacity doivent venir de la même source, sinon un transform CSS statique en parallèle
  // casserait le cache interne de GSAP au premier tween.
  // transformOrigin est remis au centre à chaque fois : la fermeture le déplace en haut à
  // droite pour sa bascule, et cette valeur reste inline sinon — le hover (scale/rotate)
  // et l'ouverture suivante pivoteraient alors depuis le coin.
  function setClosedState(squares: HTMLElement[]) {
    // scale est remis à 1 : un carré fermé alors qu'il était survolé garde sinon
    // l'agrandissement du hover et rejoue son entrée en grand.
    // autoAlpha plutôt qu'opacity : il pose aussi visibility: hidden. Un décalage de -110 %
    // laisse une bande du carré dans l'écran, invisible mais cliquable et atteignable au
    // clavier ; visibility l'en retire vraiment.
    gsap.set(squares, {
      xPercent: -110,
      y: 0,
      rotation: 0,
      scale: 1,
      autoAlpha: 0,
      transformOrigin: 'center center',
    })
  }

  function open(squares: HTMLElement[]): Promise<void> {
    // Un clic pendant la chute laisserait sinon le tween de fermeture continuer à pousser
    // y et rotation pendant que l'entrée rejoue xPercent : les deux se superposeraient.
    gsap.killTweensOf(squares)

    if (prefersReducedMotion()) {
      gsap.set(squares, { xPercent: 0, y: 0, rotation: 0, autoAlpha: 1, clearProps: 'transform,transformOrigin' })
      return Promise.resolve()
    }

    // L'ouverture doit d'abord réinitialiser y/rotation : la fermeture les a laissés
    // à leur valeur de chute, et le glissement d'entrée ne les touche pas.
    setClosedState(squares)

    return new Promise((resolve) => {
      gsap.to(squares, {
        xPercent: 0,
        autoAlpha: 1,
        duration: 0.7,
        ease: 'back.out(1.4)',
        stagger: 0.08,
        // Retire le transform inline une fois l'entrée terminée : sinon il bloque le
        // hover:scale-110 (Tailwind) qui doit reprendre le contrôle du transform.
        clearProps: 'transform,transformOrigin',
        onComplete: resolve,
      })
    })
  }

  // Chute + bascule vers la gauche : rotation négative avec transformOrigin en haut à
  // droite, pour que le coin inférieur gauche "tombe" visuellement plus que le reste,
  // simulant un poids de ce côté. La disparition vient du fait que les carrés quittent le
  // viewport (y: 120vh, pas une propriété relative à leur propre taille) — pas d'opacity,
  // pour donner l'impression qu'ils sont réellement tombés plus bas, pas qu'ils s'effacent.
  function close(squares: HTMLElement[]) {
    // Même raison qu'à l'ouverture : une entrée encore en cours continuerait à animer
    // xPercent/opacity par-dessus la chute.
    gsap.killTweensOf(squares)

    if (prefersReducedMotion()) {
      setClosedState(squares)
      return
    }

    gsap.to(squares, {
      y: '120vh',
      rotation: -14,
      duration: 0.6,
      ease: 'power2.in',
      stagger: 0.06,
      transformOrigin: 'top right',
      // La chute doit rester visible : les carrés ne sont retirés du rendu et de la
      // navigation clavier qu'une fois sortis de l'écran.
      onComplete: () => setClosedState(squares),
    })
  }

  // Anime le passage colonne/ligne et le changement de taille des carrés au
  // redimensionnement (rotation d'écran, restauration de fenêtre, etc.) : flex-direction
  // n'est pas interpolable en CSS pur (le navigateur bascule instantanément), donc Flip
  // capture la position/taille avant, laisse le CSS responsive reflow normalement, puis
  // anime la transition complète vers le nouvel état.
  // À n'activer que pendant que le tiroir est ouvert (transform déjà nettoyé par
  // clearProps) : fermé, Flip écraserait le décalage hors écran qui masque les carrés.
  function watchResponsiveLayout(squares: HTMLElement[]): () => void {
    let previousState = Flip.getState(squares)
    let resizeTimeout: ReturnType<typeof setTimeout>

    function onResize() {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        Flip.from(previousState, {
          targets: squares,
          duration: 0.4,
          ease: 'power2.inOut',
          onComplete: () => gsap.set(squares, { clearProps: 'transform' }),
        })
        previousState = Flip.getState(squares)
      }, 150)
    }

    window.addEventListener('resize', onResize)
    return () => {
      clearTimeout(resizeTimeout)
      window.removeEventListener('resize', onResize)
    }
  }

  return { setClosedState, open, close, watchResponsiveLayout }
}
