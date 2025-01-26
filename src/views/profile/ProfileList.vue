<template>
  <div class="profile-list flex flex-column align-items-center">
    <h2 v-if="profiles.length" class="text-center text-white text-xl mb-4">
      Profiles
    </h2>

    <div
      class="profiles flex align-items-center justify-content-center flex-wrap gap-7"
    >
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
          <i
            v-if="isEditing && profile.id !== '999'"
            class="pi-pencil pi pencil-icon absolute bottom-0 right-0"
          ></i>
        </div>
        <span class="text-white font-bold">{{ profile.name }}</span>
      </div>
    </div>
    <Button
      :label="isEditing ? 'Done' : 'Edit'"
      class="mt-4 edit-button"
      severity="secondary"
      @click="toggleEdit"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import Button from "primevue/button";
import router from "@/router";
import { readAppData } from "@/helpers/ElectronHelper";

interface Profile {
  id: string;
  name: string;
  icon: string;
}
const profiles = ref<Array<Profile>>([]);
const isEditing = ref(false);

function SelectOrNewProfile(profile: Profile) {
  if (profile.name.includes("New Profile")) {
    router.push({ name: "createProfile" });
    return;
  }
  if (isEditing) {
    router.push({ name: "editProfile", params: { profileId: profile.id } });
    return
  }
  router.push({ name: "portfolio", params: { profileId: profile.id } });
}

function toggleEdit() {
  isEditing.value = !isEditing.value;
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

.profile-list {
  margin-bottom: 300px;
}
</style>

<style lang="scss">
.profiles {
  .p-button-label {
    display: none;
  }
  .pi {
    font-size: 2rem;
  }
  .pencil-icon {
    font-size: 1rem;
    color: white;
    background-color: black;
    border-radius: 50%;
    padding: 0.5rem;
  }
}
</style>
