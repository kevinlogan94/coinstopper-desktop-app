<template>
  <div class="flex justify-content-center align-items-center h-screen">
    <Card>
      <template #title>Create your profile</template>
      <template #subtitle v-if="active == 1"
        >We will need your Coinbase<a @click.prevent="openExternalUrl" href="">
          Api Keys
        </a></template
      >
      <template #content>
        <form v-if="active == 0" @submit.prevent="active = 1">
          <div class="field">
            <label for="username" class="block">Username</label>
            <InputText
              v-model="formData.username"
              id="username"
              class="w-full"
              maxlength="12"
              required
              placeholder="Enter your username"
            />
          </div>
          <Button label="Next" type="submit" class="mt-4" />
        </form>
        <form v-if="active == 1" @submit.prevent="CreateProfile">
          <div class="field">
            <label for="coinbaseApiKey" class="block">Coinbase Api Key</label>
            <InputText
              v-model="formData.coinbaseApiKey"
              id="coinbaseApiKey"
              class="w-full"
              required
              placeholder="organizations/550e8400-e29b-41d4-a716-446655440000/apiKeys/123e4567-e89b-12d3-a456-426614174000"
            />
            <label for="coinbaseApiSecret" class="block"
              >Coinbase Api Secret</label
            >
            <!-- TODO: Change this to be a password component -->
            <TextArea
              v-model="formData.coinbaseApiSecret"
              placeholder="-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIC1+v8K9Q98Y7J2N1l5Q8J3K5G8Y7Jsdf2N1l5Y7J2N1gfl5J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N\n-----END EC PRIVATE KEY-----\n"
              required
              class="w-full"
              auto-resize
              id="coinbaseApiSecret"
            ></TextArea>
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
          <div class="flex justify-content-between">
            <Button
              label="Back"
              class="mt-2"
              @click="active = 0"
              severity="secondary"
            />
            <Button
              label="Submit"
              type="submit"
              class="mt-2"
              severity="success"
              :disabled="!testConnectionSuccessful"
            />
          </div>
        </form>
      </template>
      <template #footer>
        <Steps v-model:activeStep="active" :model="stepsToTake" />
      </template>
    </Card>
  </div>
</template>

<script lang="ts" setup>
import router from "@/router";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { computed, reactive, ref } from "vue";
import Steps from "primevue/steps";
import TextArea from "primevue/textarea";
import Card from "primevue/card";
import { createProfile } from "@/helpers/AppDataHelper";

const isLoading = ref(false);
const testConnectionSuccessful = ref(false);
const testConnectionWasRan = ref(false);
const active = ref(0);
const stepsToTake = ref([
  {
    label: "Personal Info",
  },
  {
    label: "Credentials",
  },
]);
const formData = reactive({
  username: "",
  coinbaseApiKey: "",
  coinbaseApiSecret: "",
  whiteListTokens: [],
});

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
      formData.coinbaseApiKey,
      formData.coinbaseApiSecret
    );
  testConnectionSuccessful.value = credentialsAreValid;
  isLoading.value = false;
  testConnectionWasRan.value = true;
};

const openExternalUrl = () => {
  const coinbaseCreateApiKeysUrl =
    "https://docs.cdp.coinbase.com/get-started/docs/cdp-api-keys";
  window.electronAPI.openExternal(coinbaseCreateApiKeysUrl);
};

const CreateProfile = async () => {
  const newProfile = await createProfile(formData.username, {
    id: "1",
    platform: "coinbase",
    apiKey: formData.coinbaseApiKey,
    apisecret: formData.coinbaseApiSecret,
  });

  if (!newProfile) {
    return;
  }

  router.push({name: "portfolio", params: { profileId: newProfile.id }});
};
</script>

<style lang="scss" scoped>
.p-card {
  min-width: 600px;
}
.p-inputtextarea {
  min-width: 800px;
}
</style>
