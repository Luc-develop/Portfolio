<script setup lang="ts">
import { siGithub } from 'simple-icons'

const { colors } = useSectionPalette()
const { form, status, error, isComplete, submit } = useContactForm()
const { inset: keyboardInset, revealField } = useVirtualKeyboard()

// Le clavier recouvre le bas de la dernière section, qui est aussi le bas du document : sans
// cette réserve, il n'y a plus rien à faire défiler et le dernier champ ne peut pas remonter
// au-dessus de lui.
const contentPadding = computed(() =>
  keyboardInset.value ? { paddingBottom: `${keyboardInset.value}px` } : undefined,
)

function fieldFromFocus(): HTMLElement | null {
  const el = document.activeElement
  if (!el) return null
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ? el as HTMLElement : null
}

// Deux déclencheurs, pour deux moments distincts : l'ouverture du clavier, qui arrive bien
// après le focus qui l'a provoquée, et le passage d'un champ à l'autre alors qu'il est déjà
// ouvert — auquel cas sa hauteur ne change pas et rien ne serait observé.
// flush post : la réserve de défilement doit exister dans le DOM avant qu'on calcule de
// combien remonter.
watch(keyboardInset, (value) => {
  if (!value) return
  const field = fieldFromFocus()
  if (field) revealField(field)
}, { flush: 'post' })

function onFieldFocus(event: FocusEvent) {
  if (!keyboardInset.value) return
  revealField(event.target as HTMLElement)
}

// Deux tracés figés ici : l'enveloppe n'est pas une marque et n'a jamais eu sa place dans
// simple-icons, et LinkedIn a été retiré du catalogue. Même format 24×24 plein que GitHub,
// pour que les trois pictogrammes aient le même poids visuel.
const MAIL_PATH = 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z'
const LINKEDIN_PATH = 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z'

const links = [
  { label: 'Email', value: 'fery.luc@outlook.com', href: 'mailto:fery.luc@outlook.com', path: MAIL_PATH },
  { label: 'LinkedIn', value: 'luc-fery', href: 'https://www.linkedin.com/in/luc-fery', path: LINKEDIN_PATH },
  { label: 'GitHub', value: 'lfmindforge', href: 'https://github.com/lfmindforge', path: siGithub.path },
]

const labelClass = 'text-xs uppercase tracking-wider text-[var(--accent)]'

const fieldClass = `w-full rounded-lg bg-slate-100/10 px-4 py-3 text-base text-slate-100
  ring-1 ring-inset ring-slate-100/20 outline-none transition-[box-shadow] duration-200
  placeholder:text-slate-100/40 focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]`
</script>

<template>
  <SectionPanel
    :color="colors.contact.panel"
    title="Contact"
    side="left"
    last
  >
    <div
      class="mx-auto flex max-w-5xl flex-col gap-12 px-6 pb-24 pt-16 lg:pt-24 sm:px-10 lg:px-16"
      :style="contentPadding"
    >
      <header class="flex flex-col gap-4">
        <p class="max-w-xl text-base leading-relaxed text-slate-100/80 sm:text-lg">
          Une offre, une question sur un projet, ou juste l'envie d'échanger : écris-moi.
        </p>
      </header>

      <!-- Deux colonnes seulement à partir de xl : en dessous, un formulaire et une liste
           côte à côte sont trop serrés. -->
      <div class="grid gap-12 xl:grid-cols-[1fr_auto] xl:gap-16">
        <form class="flex flex-col gap-5" @submit.prevent="submit" @focusin="onFieldFocus">
          <div class="flex flex-col gap-2">
            <label for="contact-name" :class="labelClass">
              Nom
            </label>
            <input
              id="contact-name"
              v-model="form.name"
              type="text"
              name="name"
              required
              autocomplete="name"
              :class="fieldClass"
            >
          </div>

          <div class="flex flex-col gap-2">
            <label for="contact-email" :class="labelClass">
              Email
            </label>
            <input
              id="contact-email"
              v-model="form.email"
              type="email"
              name="email"
              required
              autocomplete="email"
              :class="fieldClass"
            >
          </div>

          <div class="flex flex-col gap-2">
            <label for="contact-message" :class="labelClass">
              Message
            </label>
            <textarea
              id="contact-message"
              v-model="form.message"
              name="message"
              required
              rows="5"
              :class="fieldClass"
            />
          </div>

          <!-- Champ leurre : hors tabulation et invisible, seul un robot le remplit. Son
               nom évite tout ce que le remplissage automatique reconnaît. -->
          <input
            v-model="form._gotcha"
            type="text"
            name="_gotcha"
            tabindex="-1"
            autocomplete="off"
            aria-hidden="true"
            class="absolute h-px w-px overflow-hidden opacity-0"
          >

          <div class="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              :disabled="status === 'sending' || !isComplete"
              class="rounded-lg px-6 py-3 text-sm font-medium text-slate-100 shadow-lg
                     ring-1 ring-inset ring-slate-100/20 transition-[box-shadow] duration-200
                     hover:shadow-[0_0_24px_var(--send-glow)]
                     disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              :style="{ backgroundColor: colors.contact.square, '--send-glow': colors.contact.square }"
            >
              {{ status === 'sending' ? 'Envoi…' : 'Envoyer' }}
            </button>

            <!-- aria-live : le résultat arrive après coup, il doit être annoncé sans que
                 le focus quitte le formulaire. -->
            <p
              v-if="status === 'success' || status === 'error'"
              aria-live="polite"
              class="text-sm"
              :class="status === 'success' ? 'text-slate-100/80' : 'text-slate-100'"
            >
              {{ status === 'success' ? 'Message envoyé, je te réponds vite.' : error }}
            </p>
          </div>

          <p class="max-w-md text-xs leading-relaxed text-slate-100/50">
            Les informations envoyées ne servent qu'à te répondre. Elles transitent par
            Formspree, un service tiers hébergé aux États-Unis qui me les fait suivre par
            mail, et ne sont conservées ni sur ce site, ni pour un autre usage.
          </p>
        </form>

        <ul class="flex flex-col divide-y divide-slate-100/20 border-y border-slate-100/20 xl:w-72">
          <li v-for="link in links" :key="link.label">
            <a
              :href="link.href"
              :target="link.href.startsWith('mailto:') ? undefined : '_blank'"
              rel="noopener"
              class="flex flex-col gap-1 py-4 transition-opacity hover:opacity-70"
            >
              <span class="flex items-center gap-2" :class="labelClass">
                <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path :d="link.path" />
                </svg>
                {{ link.label }}
              </span>
              <span class="text-lg font-medium">{{ link.value }}</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </SectionPanel>
</template>
