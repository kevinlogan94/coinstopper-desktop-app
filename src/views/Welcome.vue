<template>
  <Card class="p-4">
    <template #title>
      <div class="logo flex justify-content-center">
        <img src="/img/logo.png" alt="Coin Stopper Logo" class="logo-img" />
      </div>
    </template>
    <template #content>
      <div v-if="!profiles">
        <!-- Welcome Title -->
        <h1 class="text-center text-white mb-4">Welcome to Coin Stopper</h1>

        <!-- Create Profile Button -->
        <Button
          label="Create Profile"
          class="button-success w-full"
          @click="onCreateProfile"
        />
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import Card from "primevue/card";
import router from "@/router";
import { onMounted, ref } from "vue";
import { readAppData } from "@/helpers/ElectronHelper";
import { Profile } from "main/models";

const profiles = ref<Array<Profile>>([]);

onMounted(async () => {
  //todo handle appdata file not being organized yet.
  const appData = await readAppData();
  profiles.value = appData?.profiles;
  if (profiles?.value?.length) {
    router.push({ name: "profileList" });
  }
});

const onCreateProfile = async (): Promise<void> => {
  router.push({ name: "createProfile" });
};
</script>

<style lang="scss" scoped>
/* Logo Styling */
.logo-img {
  width: 80px;
  height: auto;
}
</style>
