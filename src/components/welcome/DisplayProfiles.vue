<template>
  <div class="display-profiles flex flex-column align-items-center">
    <h2 class="text-center text-white text-xl mb-4">Profiles</h2>

    <div class="flex align-items-center justify-content-center">
      <div
        v-for="profile in profiles"
        :key="profile.id"
        class="col-4 flex align-items-center flex-column"
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
import { ref } from "vue";
import Button from "primevue/button";
import router from "@/router";

interface Profile {
  id: number;
  name: string;
  icon: string;
}

const profiles = ref<Profile[]>([
  { id: 1, name: "Steven", icon: "pi pi-user" },
  { id: 2, name: "Elisabeth", icon: "pi pi-user" },
  { id: 3, name: "Kevin", icon: "pi pi-user" },
  { id: 4, name: "New Profile", icon: "pi pi-plus" },
]);

function SelectOrNewProfile(profile: Profile) {
  if (profile.name.includes("New Profile")) {
    console.log("Create Profile");
    router.push("CreateProfile");
    return;
  }
  console.log("Select Profile");
  router.push("Dashboard");
}
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
