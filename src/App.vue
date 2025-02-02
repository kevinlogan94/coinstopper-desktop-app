<template>
  <div
    class="app-container"
    :class="{ 'centered-layout': displayCenteredLayout }"
  >
    <router-view />
    <footer class="footer text-center">
      <Button icon="pi pi-refresh" text @click="refreshApp" />
      <Button icon="pi pi-sync" text @click="restartApp" />
      <p class="text-sm text-gray-400">Version {{ version }}</p>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import Button from "primevue/button";
import packageInfo from "../package.json";
import router from "./router";
import { computed, onMounted } from "vue";
import { getAllProfiles } from "./helpers/AppDataHelper";

const version: string = packageInfo.version;

console.log('👋 This message is being logged by "App.vue", included via Vite');

const refreshApp = () => {
  window.electronAPI.refreshApp();
};

onMounted(async () => {

  //Turn on trading assistants if they aren't already
  const profiles = await getAllProfiles();
  profiles.forEach(async (profile) => {
    if (
      profile?.appConfig?.trackerEnabled &&
      !(await window.electronAPI.isTradingAssistantRunning(profile.id))
    ) {
      console.log(profile.appConfig.trackerEnabled);
      window.electronAPI.startTradingAssistant(profile.id);
    }
  });
});

const restartApp = async () => {
  await router.push("/");
  await window.electronAPI.refreshApp();
};

const displayCenteredLayout = computed(() => {
  return router.currentRoute.value.name != "portfolio";
});
</script>

<style lang="scss" scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh; // Ensures the container takes up the full viewport height

  .footer {
    position: fixed;
    bottom: 0;
    width: 100%;
    padding: 1rem;
  }
}

.centered-layout {
  justify-content: center;
  align-items: center;

  $primary-color: #42b983;
  background: linear-gradient(
    135deg,
    $primary-color,
    #1a1f3c
  ); /* Subtle gradient */
}
</style>
