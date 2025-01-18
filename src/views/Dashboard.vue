<template>
<div
    class="welcome-screen flex justify-content-center align-items-center h-screen"
  >
    <div class="welcome-card p-4 shadow-2 border-round bg-gray-900">
      <!-- Welcome Title -->
      <h1 class="text-center text-white mb-4">Dashboard</h1>
      <Button label="Start Algorithm" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { isEmptyObject } from "@/Helpers";
import { readAppData } from "@/utility";
import { Profile } from "main/models";
import Button from "primevue/button";
import { onMounted, ref } from "vue";

const profile = ref<Profile>();

onMounted(async () => {
  const appData = await readAppData();
  if (isEmptyObject(appData)) {
    console.error("Check your profiles");
  } else {
    profile.value = appData.profiles.find(profile => {
      return profile.id == "1" //make this dynamic
    })
  }
  console.log(profile.value);
})
</script>