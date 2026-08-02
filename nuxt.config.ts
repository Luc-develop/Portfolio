// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: [
    '@fontsource/space-grotesk/400.css',
    '@fontsource/space-grotesk/500.css',
    '@fontsource/space-grotesk/600.css',
    '@fontsource/space-grotesk/700.css',
  ],
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/eslint',
  ],
  app: {
    baseURL: '/Portfolio/',
    head: {
      // resizes-visual est la valeur par défaut, écrite ici pour qu'on ne soit pas tenté de
      // la remplacer par resizes-content : toute la page est géométrée en hauteurs de fenêtre
      // (panneaux en h-screen, marges de faux défilement mesurées en pixels au montage).
      // Laisser le clavier redimensionner la fenêtre de mise en page rejouerait cette
      // géométrie d'un coup et déplacerait la page de plusieurs milliers de pixels sous le
      // doigt. La place du clavier est réservée par la section Contact elle-même.
      viewport: 'width=device-width, initial-scale=1, interactive-widget=resizes-visual',
    },
  },
  runtimeConfig: {
    public: {
      // Formspree relaie le formulaire de contact, le site étant statique et sans backend.
      // L'URL n'est pas un secret : c'est le navigateur qui l'appelle.
      contactEndpoint: 'https://formspree.io/f/xkodlzzb',
    },
  },
})