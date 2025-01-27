<template>
  <Card class="center-card">
    <template #title> Edit Profile </template>
    <template #content>
      <form @submit.prevent="saveProfile" v-if="profile" class="form-content">
        <p>Edit your profile information below.</p>

        <!-- Username -->
        <div class="form-group">
          <label for="username">Username</label>
          <InputText
            id="username"
            v-model="profile.name"
            class="w-full"
            maxlength="12"
            placeholder="Enter your username"
            required
          />
        </div>

        <!-- API Key -->
        <div class="form-group">
          <label for="apiKey">API Key</label>
          <InputText
            id="apiKey"
            v-model="credentials.apiKey"
            class="w-full"
            placeholder="Enter your API Key"
            required
          />
        </div>

        <!-- API Secret -->
        <div class="form-group">
          <label for="apiSecret">API Secret</label>
          <Password
            id="apiSecret"
            v-model="credentials.apisecret"
            toggleMask
            class="w-full"
            placeholder="Enter your API Secret"
            required
          />
          <div class="flex align-items-center mt-2">
              <Button
                label="Test Connection"
                @click="testConnection"
                :loading="isLoading"
                severity="info"
              />
              <span
                v-if="testConnectionWasRan"
                class="ml-2"
                :class="{
                  'text-green-500': testConnectionSuccessful,
                  'text-red-500': !testConnectionSuccessful,
                }"
              >
                {{ testConnectionMessage }}
              </span>
            </div>
        </div>

        <div class="card-footer">
          <Button
            type="button"
            label="Cancel"
            severity="secondary"
            @click="cancelEdit"
          />
          <Button type="submit" label="Save Changes" severity="success" />
        </div>
      </form>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import router from "@/router";
import { getProfile, updateProfile } from "@/helpers/AppDataHelper";
import { Profile, Credential } from "main/models";

const props = defineProps<{ profileId: string }>();
const credentials = ref<Credential>();
const profile = ref<Profile>();
const isLoading = ref(false);
const testConnectionWasRan = ref(false);
const testConnectionSuccessful = ref(false);

const saveProfile = async () => {
  await updateProfile(props.profileId, (profileToUpdate) => {
    profileToUpdate.name = profile.value.name;
    const credentialsToUpdate = profileToUpdate.credentials.find(
      (x) => x.platform == "coinbase"
    );
    credentialsToUpdate.apiKey = credentials.value.apiKey;
    credentialsToUpdate.apisecret = credentials.value.apisecret;
  });

  router.push({ name: "profileList" });
};

const cancelEdit = () => {
  router.push({ name: "profileList" });
};

const testConnectionMessage = computed(() => {
  if (testConnectionSuccessful.value) {
    return "Test Successful!";
  }
  return "Test Failed: Check your internet connection and api keys";
});

const testConnection = async () => {
  isLoading.value = true;
  const credentialsAreValid =
    await window.electronAPI.validateCoinbaseCredentials(
      credentials.value.apiKey,
      credentials.value.apisecret
    );
  testConnectionSuccessful.value = credentialsAreValid;
  isLoading.value = false;
  testConnectionWasRan.value = true;
};

onMounted(async () => {
  const fetchedProfile = await getProfile(props.profileId);
  credentials.value = fetchedProfile.credentials.find(
    (x) => x.platform === "coinbase"
  );
  profile.value = fetchedProfile;
});
</script>

<style scoped>
.center-card {
  margin: auto;
  max-width: 500px;
}
.form-content {
  margin-top: 1rem;
}
.form-group {
  margin-bottom: 1.5rem;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
}
</style>
