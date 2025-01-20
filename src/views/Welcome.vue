<template>
  <div
    class="welcome-screen flex justify-content-center align-items-center h-screen"
  >
    <div v-if="!profiles" class="welcome-card p-4 shadow-2 border-round bg-gray-900">
      <!-- App Logo -->
      <div class="logo flex justify-content-center mb-3">
        <img src="/img/logo.png" alt="Coin Stopper Logo" class="logo-img" />
      </div>

      <!-- Welcome Title -->
      <h1 class="text-center text-white mb-4">Welcome to Coin Stopper</h1>

      <!-- Create Profile Button -->
      <Button
        label="Create Profile"
        class="button-success w-full"
        @click="onCreateProfile"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import router from "@/router";
import { onMounted, ref } from "vue";
import { readAppData } from "@/helpers/ElectronHelper";
import { Profile } from "main/models";

const profiles = ref<Array<Profile>>([]);

onMounted(async () => {
  //todo handle appdata file not being organized yet.
  const appData = await readAppData();
  profiles.value = appData.profiles;
  if (profiles.value.length) {
    router.push("SelectProfile");
  }
  console.log(profiles.value);
});

const onCreateProfile = async (): Promise<void> => {
  router.push("CreateProfile");
};
</script>

<style lang="scss" scoped>
/* Logo Styling */
.logo-img {
  width: 80px;
  height: auto;
}
</style>
