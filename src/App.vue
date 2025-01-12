<template>
  <div class="app-container">
  <router-view />
  <footer class="footer text-center">
    <Button icon="pi pi-refresh" text @click="refreshApp"/>
    <p class="text-sm text-gray-400">Version {{ version }}</p>
  </footer>
</div>
</template>

<script lang="ts" setup>
import Button from "primevue/button";
import packageInfo from "../package.json";

const version: string = packageInfo.version;

console.log('👋 This message is being logged by "App.vue", included via Vite');

const refreshApp = () => {
  window.electronAPI.refreshApp();
}
</script>

<style lang="scss" scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh; // Ensures the container takes up the full viewport height

  $primary-color: #42b983;
    background: linear-gradient(
    135deg,
    $primary-color,
    #1a1f3c
  ); /* Subtle gradient */

  .footer {
    position: fixed;
    bottom: 0;
    width: 100%;
    padding: 1rem;
  }
}
</style>