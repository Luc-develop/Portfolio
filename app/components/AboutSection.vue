<script setup lang="ts">
import { dailyStack, exploredStack } from '~/data/stack'
import { experience } from '~/data/experience'

const { colors } = useSectionPalette()

// Le site est servi sous un sous-chemin : un lien écrit en dur viserait la racine du
// domaine et donnerait un 404 en production, alors qu'il fonctionnerait en local.
const { baseURL } = useRuntimeConfig().app
// La casse doit correspondre exactement au fichier de public/ : Windows l'ignore, le
// serveur de GitHub Pages non, et le lien répondrait 404 une fois déployé.
const cvUrl = `${baseURL}Luc-Fery-CV-public.pdf`

const facts = [
  { label: 'Basé à', value: 'Liège' },
  { label: 'Disponibilité', value: 'Immédiate' },
  { label: 'Mobilité', value: 'Télétravail ou sur site' },
  { label: 'Langues', value: 'Français natif, anglais B2' },
  { label: 'Déplacements', value: 'Permis B et véhicule' },
]

// Fond des cartes, celui du hub comme les banderoles de titre. La couleur de la bordure
// animée, elle, vient de chaque logo et est posée par la carte.
const cardColors = { '--tech-surface': '#0f172a' }
</script>

<template>
  <SectionPanel
    :color="colors.about.panel"
    title="À propos"
    side="left"
  >
    <!-- Pleine largeur, sans conteneur centré : plafonner puis centrer ramenait les deux
         colonnes au milieu de l'écran, et tout l'écart gagné se perdait en marges vides.
         Ancrées aux bords de la section, elles se répondent d'un côté à l'autre. -->
    <div class="grid gap-12 px-6 pb-16 pt-16 sm:px-10 lg:grid-cols-[1.15fr_1fr] lg:gap-48 lg:px-16 lg:pt-24 xl:gap-64 xl:px-24">
      <!-- Colonne de gauche : le récit, puis le parcours qui le prolonge. L'écart entre les
           deux est plus large que les respirations internes, pour marquer le changement de
           registre entre la présentation et la chronologie. -->
      <div class="flex flex-col gap-16 lg:gap-40">
        <header class="flex flex-col gap-6 bg-slate-900 p-6 sm:p-8">
          <p class="max-w-2xl text-base leading-relaxed text-slate-100/80 sm:text-lg">
            Je construis des applications web complètes, du modèle de données à l'interface.
            J'ai commencé en autodidacte il y a cinq ans, puis j'ai décidé d'en faire mon
            métier : les deux dernières années, je les ai passées en formation pour décrocher
            un vrai diplôme. Ce n'était pas un essai, c'était un choix définitif.
          </p>
          <p class="max-w-2xl text-base leading-relaxed text-slate-100/80 sm:text-lg">
            J'ai appris seul, avant l'IA générative, en cherchant, en cassant et en
            recommençant. C'est de là que vient mon autonomie : donnez-moi un problème encore
            flou, je vais chercher jusqu'à le comprendre, puis le mettre en place.
          </p>
          <p class="max-w-2xl text-base leading-relaxed text-slate-100/80 sm:text-lg">
            <strong class="font-semibold text-[var(--accent)]">
              Je recherche aujourd'hui un premier poste de développeur.
            </strong>
            Le domaine compte moins que ce qu'il y a à y apprendre : web, mobile, jeu, je
            prends.
          </p>
        </header>

        <!-- Même fond que les banderoles : les blocs de texte se détachent du panneau au
             lieu de flotter dessus. -->
        <section class="flex flex-col gap-6 bg-slate-900 p-6 sm:p-8">
          <h3 class="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
            Parcours
          </h3>
          <ol class="flex flex-col border-l border-sand/30">
            <li
              v-for="item in experience"
              :key="item.key"
              class="relative flex flex-col gap-1 py-5 pl-6"
            >
              <span
                class="absolute -left-[4.5px] top-7 h-2 w-2 rounded-full bg-sand"
              />
              <span class="text-xs uppercase tracking-wider text-sand">
                {{ item.period }}
              </span>
              <span class="text-lg font-medium">{{ item.role }}</span>
              <span class="text-sm text-slate-100/70">{{ item.place }}</span>
              <p class="mt-1 text-base leading-relaxed text-slate-100/80">
                {{ item.summary }}
              </p>
              <ul
                v-if="item.highlights"
                class="mt-2 flex flex-col gap-2 text-base leading-relaxed text-slate-100/70"
              >
                <li
                  v-for="highlight in item.highlights"
                  :key="highlight"
                  class="relative pl-4 before:absolute before:left-0 before:top-2 before:h-1.5
                         before:w-1.5 before:rounded-full before:bg-[var(--accent)]"
                >
                  {{ highlight }}
                </li>
              </ul>
            </li>
          </ol>
        </section>
      </div>

      <!-- Colonne de droite : l'outillage, puis les informations pratiques. -->
      <div class="flex flex-col gap-12">
        <!-- Cadre d accent complet et ombre sans décalage : à offset nul, elle se répartit
             également sur les quatre côtés au lieu d'appuyer deux bordures. -->
        <section
          class="flex flex-col gap-5 rounded-md border border-[color:var(--accent-line)] p-6 sm:p-8
                 shadow-[0_0_24px_-2px_rgba(0,0,0,0.6)]"
        >
          <h3 class="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
            Au quotidien
          </h3>
          <p class="text-sm text-slate-100/60">
            Retournez une carte pour savoir pourquoi cet outil.
          </p>
          <!-- Flex plutôt que grid : le nombre de cartes ne tombe pas juste, et une
               dernière rangée incomplète se centre au lieu de rester collée à gauche. -->
          <ul class="flex flex-wrap justify-center gap-3" :style="cardColors">
            <li
              v-for="item in dailyStack"
              :key="item.key"
              class="w-[calc(50%-0.375rem)] 2xl:w-[calc(33.333%-0.5rem)]"
            >
              <TechCard :item="item" />
            </li>
          </ul>
        </section>

        <section
          class="flex flex-col gap-5 rounded-md border border-[color:var(--accent-line)] p-6 sm:p-8
                 shadow-[0_0_24px_-2px_rgba(0,0,0,0.6)]"
        >
          <h3 class="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
            Déjà pratiqué
          </h3>
          <ul class="flex flex-wrap justify-center gap-3" :style="cardColors">
            <li
              v-for="item in exploredStack"
              :key="item.key"
              class="w-[calc(50%-0.375rem)] 2xl:w-[calc(33.333%-0.5rem)]"
            >
              <TechCard :item="item" />
            </li>
          </ul>
        </section>

      </div>
    </div>

    <template #footer-title>
      Infos utiles
    </template>

    <template #footer>
      <dl class="grid gap-6 sm:grid-cols-3 lg:grid-cols-5">
        <div v-for="fact in facts" :key="fact.label" class="flex flex-col gap-1">
          <dt class="text-xs uppercase tracking-wider text-[var(--accent)]">
            {{ fact.label }}
          </dt>
          <dd class="text-base font-medium">
            {{ fact.value }}
          </dd>
        </div>
      </dl>

      <!-- Lien secondaire et non bouton : le CV fait sortir du site, il ne doit pas
           court-circuiter la lecture des projets. -->
      <a
        :href="cvUrl"
        download
        class="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)]
               underline underline-offset-4 transition-opacity hover:opacity-70"
      >
        <svg
          viewBox="0 0 24 24"
          class="h-4 w-4"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
        Télécharger mon CV
      </a>
    </template>
  </SectionPanel>
</template>
