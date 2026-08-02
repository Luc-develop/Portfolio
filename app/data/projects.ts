export interface ProjectData {
  key: string
  title: string
  status: string
  pitch: string
  /** Clés d'entrées de app/data/stack.ts, pour que les badges héritent des couleurs. */
  stack: string[]
  repo?: string
  /** Nom du fichier dans public/, sans barre oblique : le baseURL est ajouté au rendu. */
  image?: string
  imageAlt?: string
  /**
   * Dimensions intrinsèques du fichier. Renseignées sur l'élément <img>, elles réservent le
   * bon rapport avant le décodage et évitent que la mise en page saute — ce qui, sur cette
   * page, décalerait la hauteur mesurée par usePinnedPanels pour son faux défilement.
   */
  imageWidth?: number
  imageHeight?: number
  /** Ce que la construction du projet a appris — plus parlant que la liste des features. */
  learned?: string
}

export const projects: ProjectData[] = [
  {
    key: 'gift-rumble',
    title: 'Gift Rumble : Rise & Glow',
    status: 'Travail de fin d\'études',
    pitch:
      'Une plateforme de don entre particuliers, gamifiée, qui tourne au moteur social : elle met en relation ceux qui demandent et ceux qui peuvent réaliser la demande.',
    stack: ['nestjs', 'nuxt', 'postgresql', 'redis'],
    repo: 'https://github.com/orgs/lfmindforge/repositories',
    image: 'grrg.webp',
    imageAlt: 'Interface de Gift Rumble',
    imageWidth: 1280,
    imageHeight: 720,
    learned:
      'L\'authentification complète, les WebSocket et le SSE, la limitation de débit, la compression, l\'internationalisation et la mise en cache.',
  },
  {
    key: 'bd',
    title: 'Plateforme BD',
    status: 'MVP en cours',
    pitch:
      'Un espace pour les amateurs de bande dessinée. Pitch à venir.',
    stack: ['nestjs', 'nuxt', 'postgresql', 'redis'],
    image: 'ToryuI.webp',
    imageAlt: 'Interface de la plateforme BD',
    imageWidth: 1280,
    imageHeight: 876,
  },
]
