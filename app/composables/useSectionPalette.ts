import { accent, accentLine, sectionColors } from '~/data/palette'

export function useSectionPalette() {
  // Exposées en variables CSS par la page : les composants s'y réfèrent sans importer la
  // palette, et une seule déclaration met à jour liserés, titres, libellés et halos.
  const accentVars = {
    '--accent': accent,
    '--accent-line': accentLine,
  }

  return { colors: sectionColors, accentVars }
}
