<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<style>
/* Un panneau rétrécit (scale 0.7) avant d'être recouvert par le suivant : c'est le fond du
   document qui apparaît derrière lui, blanc par défaut. */
html {
  background-color: #0f172a;
}
</style>
