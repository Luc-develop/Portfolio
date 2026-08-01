export interface ExperienceItem {
  key: string
  period: string
  role: string
  place: string
  summary: string
  /** Ce qui a été construit, et ce que ça permet — une ligne par réalisation. */
  highlights?: string[]
}

export const experience: ExperienceItem[] = [
  {
    key: 'keiro',
    period: 'Février à mai 2026',
    role: 'Stagiaire développeur fullstack',
    place: 'Keiro, Grâce-Hollogne',
    summary:
      'Deux projets en trois mois : l\'un en équipe sur une base existante, l\'autre seul et de bout en bout.',
    highlights: [
      'ERP interne, en équipe : intégration de l\'interface et écriture des endpoints manquants côté API, pour centraliser dans un seul outil ce qui vivait jusque-là éparpillé.',
      'PoC pour un assureur automobile, seul et de bout en bout : l\'assuré photographie lui-même son véhicule depuis son téléphone, une analyse IA des clichés alimente le dossier, et le gestionnaire tranche depuis une interface dédiée.',
      'Sur ce même PoC : une API exposée aux gestionnaires qui disposent déjà de leur propre outil, et les droits RGPD des assurés sur leurs données.',
    ],
  },
  {
    key: 'eafc',
    period: 'Octobre 2024 à juillet 2026',
    role: 'BES Développeur Web',
    place: 'EAFC, Fléron',
    summary:
      'Deux ans de fondamentaux, du cycle complet d\'une requête HTTP jusqu\'aux mécanismes internes d\'un framework back-end, travaillés en projet d\'équipe.',
    highlights: [
      'Travail de fin d\'études, Gift Rumble : Rise & Glow.',
    ],
  },
  {
    key: 'technifutur',
    period: '2021 à 2022',
    role: 'Formation développeur mobile',
    place: 'Technifutur, Seraing',
    summary:
      'Développement d\'applications mobiles natives, premier contact avec Kotlin et Swift.',
  },
]
