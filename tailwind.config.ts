import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default <Partial<Config>>{
  // Les variantes hover: ne s'appliquent qu'aux appareils capables de survoler. Au toucher,
  // l'état :hover reste collé après un appui et fige l'effet jusqu'au prochain appui
  // ailleurs.
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Troisième couleur du site, chaude, en contrepoint du bleu des sections et du vert
        // des liserés : elle sert aux repères de lecture (dates, jalons) que le blanc et le
        // bleu ne suffisaient plus à distinguer.
        sand: '#d9b26f',
      },
    },
  },
}
