export type ContactStatus = 'idle' | 'sending' | 'success' | 'error'

export function useContactForm() {
  const form = reactive({
    name: '',
    email: '',
    message: '',
    // Piège à robots : un humain ne le remplit jamais, il est masqué et hors tabulation.
    // Le nom compte : un champ appelé « website » est une cible classique du remplissage
    // automatique des navigateurs et des gestionnaires de mots de passe. Rempli à l'insu du
    // visiteur, il faisait passer chaque envoi pour un robot, et le message n'était jamais
    // transmis. « _gotcha » est en outre la convention de Formspree pour les leurres.
    _gotcha: '',
  })

  const status = ref<ContactStatus>('idle')
  const error = ref('')

  // Le champ leurre n'entre pas dans le compte : le formulaire est complet quand un humain
  // a rempli les trois champs visibles.
  const isComplete = computed(
    () => Boolean(form.name.trim() && form.email.trim() && form.message.trim()),
  )

  const endpoint = useRuntimeConfig().public.contactEndpoint

  async function submit() {
    if (status.value === 'sending') return
    error.value = ''

    // Réponse identique à un envoi réussi : un robot ne doit pas apprendre qu'il a été
    // détecté, sans quoi il réessaie en contournant le piège.
    if (form._gotcha) {
      status.value = 'success'
      return
    }

    if (!endpoint) {
      status.value = 'error'
      error.value = 'Le service d\'envoi n\'est pas encore configuré.'
      return
    }

    status.value = 'sending'

    try {
      await $fetch(endpoint, {
        method: 'POST',
        // Sans cet en-tête, Formspree répond une page HTML de redirection au lieu du JSON
        // attendu, et l'envoi paraît échouer alors qu'il est passé.
        headers: { Accept: 'application/json' },
        body: { name: form.name, email: form.email, message: form.message },
      })
      status.value = 'success'
      form.name = ''
      form.email = ''
      form.message = ''
    }
    catch (cause) {
      status.value = 'error'
      // Le détail renvoyé par le service est en anglais et ne s'adresse pas au visiteur :
      // il part dans la console, le message affiché reste le nôtre.
      console.error('[contact] envoi refusé', cause)
      error.value = 'L\'envoi a échoué. Réessaie, ou écris-moi directement par mail.'
    }
  }

  return { form, status, error, isComplete, submit }
}
