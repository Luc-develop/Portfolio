// Hauteur recouverte par le clavier virtuel, en pixels, et outil pour dégager un champ qu'il
// masque.
//
// La fenêtre de mise en page ne bouge pas quand le clavier s'ouvre (interactive-widget vaut
// resizes-visual, voir nuxt.config) : seule la fenêtre visuelle rétrécit. C'est donc elle
// qu'on interroge, et non innerHeight, qui reste à sa valeur d'origine. iOS ne procède pas
// autrement, ce qui rend la mesure identique sur les deux plateformes.
export function useVirtualKeyboard() {
  const inset = ref(0)

  // En dessous, l'écart relève de l'arrondi ou d'une barre d'outils, pas d'un clavier.
  const MIN_KEYBOARD_HEIGHT = 120

  // Marge entre le bas du champ et le haut du clavier.
  const FIELD_MARGIN = 16

  function measure() {
    const viewport = window.visualViewport
    if (!viewport) return

    const covered = window.innerHeight - viewport.height - viewport.offsetTop
    inset.value = covered > MIN_KEYBOARD_HEIGHT ? Math.round(covered) : 0
  }

  // Le navigateur remonte de lui-même le champ qui prend le focus, mais il se contente d'en
  // rendre le haut visible : un textarea plus haut que quelques lignes reste coupé par le
  // clavier. On finit le travail en dégageant son bas.
  function revealField(field: HTMLElement) {
    const viewport = window.visualViewport
    if (!viewport) return

    const rect = field.getBoundingClientRect()
    const covered = rect.bottom + FIELD_MARGIN - (viewport.offsetTop + viewport.height)
    if (covered <= 0) return

    // Un champ plus haut que la bande visible ne peut pas y tenir en entier : on ne remonte
    // alors que jusqu'à son sommet, sinon on le pousserait hors de l'écran par le haut.
    const room = Math.max(rect.top - viewport.offsetTop - FIELD_MARGIN, 0)
    window.scrollBy({ top: Math.min(covered, room), behavior: 'smooth' })
  }

  onMounted(() => {
    window.visualViewport?.addEventListener('resize', measure)
    // Le défilement de la fenêtre visuelle à l'intérieur de la fenêtre de mise en page change
    // offsetTop, donc la part réellement recouverte.
    window.visualViewport?.addEventListener('scroll', measure)
  })

  onUnmounted(() => {
    window.visualViewport?.removeEventListener('resize', measure)
    window.visualViewport?.removeEventListener('scroll', measure)
  })

  return { inset, revealField }
}
