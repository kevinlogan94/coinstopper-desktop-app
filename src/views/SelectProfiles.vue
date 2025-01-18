<template>
  <div class="display-profiles flex flex-column align-items-center">
    <h2 v-if="profiles.length" class="text-center text-white text-xl mb-4">
      Profiles
    </h2>

    <div class="flex align-items-center justify-content-center flex-wrap gap-7">
      <div
        v-for="profile in profiles"
        :key="profile.id"
        class="flex align-items-center flex-column"
      >
        <div class="relative">
          <Button
            @click="SelectOrNewProfile(profile)"
            rounded
            severity="secondary"
            class="select-profile-button"
            aria-label="add profile"
            :icon="profile.icon"
          ></Button>
        </div>
        <span class="text-white font-bold">{{ profile.name }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import Button from "primevue/button";
import router from "@/router";
import { readAppData } from "@/utility";

interface Profile {
  id: string;
  name: string;
  icon: string;
}
const profiles = ref<Array<Profile>>([]);

function SelectOrNewProfile(profile: Profile) {
  if (profile.name.includes("New Profile")) {
    console.log("Create Profile");
    router.push("CreateProfile");
    return;
  }
  console.log("Select Profile");
  router.push("Dashboard");
}

onMounted(async () => {
  const appData = await readAppData();
  appData.profiles.forEach((profile) => {
    profiles.value.push({
      id: profile.id,
      name: profile.name,
      icon: "pi pi-user",
    });
  });
  profiles.value.push({ id: "999", name: "New Profile", icon: "pi pi-plus" });
});
</script>

<style lang="scss" scoped>
$profile-width-height: 6rem;

.new-profile-button {
  width: $profile-width-height;
  height: $profile-width-height;
}
.select-profile-button {
  width: $profile-width-height;
  height: $profile-width-height;
}

.display-profiles {
  margin-bottom: 300px;
}
</style>

<style lang="scss">
.display-profiles {
  .p-button-label {
    display: none;
  }
  .pi {
    font-size: 2rem;
  }
}
</style>
