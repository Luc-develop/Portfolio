export type SectionKey = 'about' | 'projects' | 'contact'

export interface SectionColors {
  /** Fond du carré de navigation, sur le hub comme sur les sections. */
  square: string
  /** Fond du panneau plein écran. */
  panel: string
}

// Palette « Givre ». Le hub (#0f172a) est la seule couleur qui ne vient pas d'ici.
// Les trois fonds occupent un arc froid resserré (225°, 255°, 285°), et l'accent est pris
// en dehors de cet arc : posé dedans, il se confondrait avec les sections au lieu de les
// structurer.
// Chaque carré est la teinte de son panneau à la luminosité la plus haute qui garde 4,6:1
// avec le texte slate-100 ; l'accent dépasse 11:1 sur les trois panneaux.
export const sectionColors: Record<SectionKey, SectionColors> = {
  about: { square: '#4c68bd', panel: '#202946' },
  projects: { square: '#755bc2', panel: '#292046' },
  contact: { square: '#9f49bc', panel: '#3f2249' },
}

/** Couleur claire des titres de bloc, libellés et halos. */
export const accent = '#a5f3fc'

/** Trait de structure : liserés des banderoles, du pied, cadres des blocs. */
export const accentLine = '#0e7490'
