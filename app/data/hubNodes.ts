import type { SectionKey } from '~/data/palette'

export interface HubNodeData {
  // Sert aussi à retrouver les couleurs de la section dans la palette courante.
  key: SectionKey
  label: string
  // Index du panneau visé dans la page (0 = hub).
  panel: number
}

export const hubNodes: HubNodeData[] = [
  { key: 'about', label: 'À propos', panel: 1 },
  { key: 'projects', label: 'Projets', panel: 2 },
  { key: 'contact', label: 'Contact', panel: 3 },
]
