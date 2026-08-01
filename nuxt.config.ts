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
  },
  runtimeConfig: {
    public: {
      // Formspree relaie le formulaire de contact, le site étant statique et sans backend.
      // L'URL n'est pas un secret : c'est le navigateur qui l'appelle.
      contactEndpoint: 'https://formspree.io/f/xkodlzzb',
    },
  },
})