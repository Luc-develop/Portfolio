<template>
  <!-- Le halo est posé dès le départ, donc recalculé à chaque frame du morph : MorphSVG
       réécrit le tracé, le flou gaussien doit suivre. C'est assumé — l'éclat pendant la
       transformation du cercle en logo fait partie de l'effet recherché. -->
  <div
    class="hub-core opacity-0 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
           w-48 h-24 drop-shadow-[0_0_40px_rgba(241,245,249,0.35)]"
  >
    <!-- viewBox deux fois plus large que haute, au même rapport que le conteneur : le
         cercle de départ reste donc rond, et le nom tient sur une ligne après le morph. -->
    <svg viewBox="0 0 200 100" class="w-full h-full">
      <circle id="hubCoreShape" class="hub-core-shape" cx="100" cy="50" r="48" fill="#f1f5f9" />
    </svg>
  </div>
</template>
