// Les fichiers par icône du paquet sont des SVG bruts, sans la couleur de marque : on passe
// donc par les exports nommés, dont le bundler n'embarque que ceux réellement importés.
import {
  siAnthropic,
  siDocker,
  siFirebase,
  siGit,
  siGreensock,
  siKeycloak,
  siKotlin,
  siNestjs,
  siNuxt,
  siPostgresql,
  siReact,
  siRedis,
  siSpringboot,
  siSupabase,
  siSwift,
  siTailwindcss,
  siTypeorm,
  siTypescript,
} from 'simple-icons'

export type StackTier = 'daily' | 'explored'

export interface StackItem {
  key: string
  name: string
  tier: StackTier
  /** Pourquoi cet outil plutôt qu'un autre, face arrière de la carte. */
  reason: string
  /** Tracé du logo officiel. */
  path: string
  /** Couleur de marque, préfixée, qui teinte le logo et la bordure animée. */
  color: string
}

// Le gris de marque de Keycloak est trop sombre pour un fond de nuit : à 2,1:1 le logo
// disparaît. Il est éclairci en gardant sa neutralité, seul écart aux couleurs officielles.
const KEYCLOAK_DISPLAY = '#9e9e9e'

// Le noir d'Anthropic est illisible sur fond sombre (1,0:1). Sa marque se décline en clair
// sur fond foncé, ce n'est donc pas un écart mais l'usage prévu.
const ANTHROPIC_DISPLAY = '#e5e5e5'

export const stack: StackItem[] = [
  {
    key: 'typescript',
    name: 'TypeScript',
    tier: 'daily',
    path: siTypescript.path,
    color: `#${siTypescript.hex}`,
    reason: 'Les erreurs de contrat se voient à l\'écriture, pas en production.',
  },
  {
    key: 'nuxt',
    name: 'Nuxt',
    tier: 'daily',
    path: siNuxt.path,
    color: `#${siNuxt.hex}`,
    reason: 'Routage, composables, SSR : j\'écris des pages, pas de la plomberie.',
  },
  {
    key: 'nestjs',
    name: 'NestJS',
    tier: 'daily',
    path: siNestjs.path,
    color: `#${siNestjs.hex}`,
    reason: 'Une structure imposée : chaque domaine a sa place, le projet ne dérive pas.',
  },
  {
    key: 'typeorm',
    name: 'TypeORM',
    tier: 'daily',
    path: siTypeorm.path,
    color: `#${siTypeorm.hex}`,
    reason: 'Le schéma décrit en TypeScript, les migrations tiennent la production.',
  },
  {
    key: 'postgresql',
    name: 'PostgreSQL',
    tier: 'daily',
    path: siPostgresql.path,
    color: `#${siPostgresql.hex}`,
    reason: 'Mon choix par défaut dès que les données ont une forme.',
  },
  {
    key: 'redis',
    name: 'Redis',
    tier: 'daily',
    path: siRedis.path,
    color: `#${siRedis.hex}`,
    reason: 'Ce qui doit être rapide et volatil n\'a rien à faire dans PostgreSQL.',
  },
  {
    key: 'docker',
    name: 'Docker',
    tier: 'daily',
    path: siDocker.path,
    color: `#${siDocker.hex}`,
    reason: 'La même stack en local et sur le serveur, donc plus de bug fantôme.',
  },
  {
    key: 'tailwind',
    name: 'Tailwind CSS',
    tier: 'daily',
    path: siTailwindcss.path,
    color: `#${siTailwindcss.hex}`,
    reason: 'Le style vit dans le composant, plus de feuille globale intouchable.',
  },
  {
    key: 'gsap',
    name: 'GSAP',
    tier: 'daily',
    path: siGreensock.path,
    color: `#${siGreensock.hex}`,
    reason: 'Le contrôle du temps, là où le CSS s\'arrête aux transitions simples.',
  },
  {
    key: 'git',
    name: 'Git',
    tier: 'daily',
    path: siGit.path,
    color: `#${siGit.hex}`,
    reason: 'L\'historique dit pourquoi le code est ainsi, ce que le code tait.',
  },
  {
    key: 'anthropic',
    name: 'Anthropic',
    tier: 'daily',
    path: siAnthropic.path,
    color: ANTHROPIC_DISPLAY,
    reason: 'Un accélérateur, pas un pilote : les décisions restent les miennes.',
  },
  {
    key: 'react',
    name: 'React',
    tier: 'explored',
    path: siReact.path,
    color: `#${siReact.hex}`,
    reason: 'De quoi lire une base existante et y contribuer sans tout reprendre.',
  },
  {
    key: 'spring-boot',
    name: 'Spring Boot',
    tier: 'explored',
    path: siSpringboot.path,
    color: `#${siSpringboot.hex}`,
    reason: 'Le découpage de NestJS côté Java : les concepts se transposent.',
  },
  {
    key: 'kotlin',
    name: 'Kotlin',
    tier: 'explored',
    path: siKotlin.path,
    color: `#${siKotlin.hex}`,
    reason: 'Le natif Android, découvert en formation mobile.',
  },
  {
    key: 'swift',
    name: 'Swift',
    tier: 'explored',
    path: siSwift.path,
    color: `#${siSwift.hex}`,
    reason: 'Le pendant iOS, abordé sur la même formation.',
  },
  {
    key: 'supabase',
    name: 'Supabase',
    tier: 'explored',
    path: siSupabase.path,
    color: `#${siSupabase.hex}`,
    reason: 'Une base Postgres et son API en quelques minutes, pour valider une idée.',
  },
  {
    key: 'firebase',
    name: 'Firebase',
    tier: 'explored',
    path: siFirebase.path,
    color: `#${siFirebase.hex}`,
    reason: 'Temps réel et auth prêts à l\'emploi quand le prototype prime.',
  },
  {
    key: 'keycloak',
    name: 'Keycloak',
    tier: 'explored',
    path: siKeycloak.path,
    color: KEYCLOAK_DISPLAY,
    reason: 'L\'authentification déléguée à un service qui fait ça mieux que moi.',
  },
]

export const dailyStack = stack.filter(item => item.tier === 'daily')
export const exploredStack = stack.filter(item => item.tier === 'explored')

// Les projets référencent les technos par clé plutôt que par libellé : leurs badges
// reprennent ainsi la couleur officielle sans la redéclarer.
export function findStackItem(key: string): StackItem | undefined {
  return stack.find(item => item.key === key)
}
