<script setup lang="ts">
import { projects } from '~/data/projects'

const { colors } = useSectionPalette()

// Le site est servi sous un sous-chemin : une source écrite en dur viserait la racine du
// domaine et donnerait un 404 en production, alors qu'elle fonctionnerait en local.
const { baseURL } = useRuntimeConfig().app
</script>

<template>
  <SectionPanel
    :color="colors.projects.panel"
    title="Projets"
    side="right"
  >
    <div class="flex flex-col gap-12 px-6 pb-24 pt-16 sm:px-10 lg:px-16 lg:pt-24 xl:px-24">
      <header class="flex flex-col gap-4">
        <p class="max-w-2xl text-base leading-relaxed text-slate-100/80 sm:text-lg">
          Deux projets conçus et construits de bout en bout. Le premier est public, en
          version 1.0.0, et son dépôt est ouvert. Le second n'a pas encore atteint son MVP,
          je le garde donc volontairement discret. Les démonstrations en ligne suivront dès
          que nous pourrons déployer le back-end ailleurs que sur des hébergements gratuits,
          qui s'endorment au bout de quelques minutes.
        </p>
      </header>

      <ul class="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <li
          v-for="project in projects"
          :key="project.key"
          class="group flex flex-col overflow-hidden rounded-lg bg-slate-900
                 ring-1 ring-inset ring-slate-100/10 shadow-[0_0_24px_-2px_rgba(0,0,0,0.6)]"
        >
          <!-- object-contain et non cover : les captures n'ont pas toutes le rapport du
               cadre, et rogner une interface la rend incompréhensible. Le cadre reste en
               16:9 pour que les deux cartes gardent la même géométrie. -->
          <img
            v-if="project.image"
            :src="`${baseURL}${project.image}`"
            :alt="project.imageAlt"
            class="aspect-video w-full bg-slate-100/5 object-contain object-center
                   transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
            decoding="async"
          >
          <!-- Sans capture, un bloc au bon rapport tient la mise en page plutôt que de la
               voir sauter à l'arrivée de l'image. -->
          <div
            v-else
            class="flex aspect-video items-center justify-center bg-slate-100/5
                   text-xs text-slate-100/40"
          >
            Capture à venir
          </div>

          <!-- flex-1 sur le contenu et mt-auto sur le lien : quel que soit le nombre de
               lignes, les deux cartes gardent leur lien aligné en bas. -->
          <div class="flex flex-1 flex-col gap-3 p-6">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <h3 class="text-xl font-medium">
                {{ project.title }}
              </h3>
              <span class="text-xs uppercase tracking-wider text-sand">
                {{ project.status }}
              </span>
            </div>

            <p class="text-sm leading-relaxed text-slate-100/80">
              {{ project.pitch }}
            </p>

            <p v-if="project.learned" class="text-sm leading-relaxed text-slate-100/70">
              <span class="text-slate-100/50">Ce que j'y ai appris : </span>{{ project.learned }}
            </p>

            <ul class="flex flex-wrap gap-2 pt-1">
              <li v-for="tech in project.stack" :key="tech">
                <TechBadge :tech-key="tech" />
              </li>
            </ul>

            <a
              v-if="project.repo"
              :href="project.repo"
              target="_blank"
              rel="noopener"
              class="mt-auto pt-4 text-sm font-medium text-[var(--accent)] underline
                     underline-offset-4 transition-opacity hover:opacity-70"
            >
              Voir le dépôt
            </a>
            <!-- Rendu en texte inerte plutôt que masqué : les deux cartes gardent la même
                 structure, et l'absence de dépôt se lit comme un état, pas comme un oubli. -->
            <span
              v-else
              aria-disabled="true"
              class="mt-auto cursor-not-allowed pt-4 text-sm font-medium text-slate-100/30"
            >
              Voir le dépôt
            </span>
          </div>
        </li>
      </ul>
    </div>
  </SectionPanel>
</template>
