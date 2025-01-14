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
              required
              placeholder="Enter your username"
            />
          </div>
          <Button label="Submit" type="submit" class="mt-4 button-success" />
        </form>
        <form v-if="active == 1" @submit.prevent="active = 2">
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
            <TextArea
              v-model="formData.coinbaseApiSecret"
              placeholder="-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIC1+v8K9Q9J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N1l5Q8J3K5G8Y7J2N\n-----END EC PRIVATE KEY-----\n"
              required
              class="w-full"
              auto-resize
              id="coinbaseApiSecret"
            ></TextArea>
          </div>
          <Button label="Submit" type="submit" class="mt-4 button-success" />
        </form>
        <form v-if="active == 2" @submit.prevent="CreateProfile">
          <div class="field">
            <label for="coinbaseApiKey" class="block">Coinbase Api Key</label>
            <InputText
              v-model="formData.coinbaseApiKey"
              id="coinbaseApiKey"
              required
              placeholder="organizations/550e8400-e29b-41d4-a716-446655440000/apiKeys/123e4567-e89b-12d3-a456-426614174000"
            />
          </div>
          <Button label="Submit" type="submit" class="mt-4 button-success" />
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
import { readAppData, writeAppData } from "@/utility";
import { Profile } from "main/models";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { reactive, ref } from "vue";
import Steps from "primevue/steps";
import TextArea from "primevue/textarea";
import Card from "primevue/card";

const active = ref(0);
const stepsToTake = ref([
  {
    label: "Personal Info",
  },
  {
    label: "Credentials",
  },
  {
    label: "Setup",
  },
]);
const formData = reactive({
  username: "",
  coinbaseApiKey: "",
  coinbaseApiSecret: "",
  whiteListTokens: [],
});

const GenerateDataFromTracker = () => {
  //trigger tracker to collect data
};

const openExternalUrl = () => {
  const coinbaseCreateApiKeysUrl =
    "https://docs.cdp.coinbase.com/get-started/docs/cdp-api-keys";
  window.electronAPI.openExternal(coinbaseCreateApiKeysUrl);
};

const CreateProfile = async () => {
  let appData = await readAppData();
  const newProfile = {
    id: "1",
    name: formData.username,
    credentials: [{ id: "1", platform: "coinbase" }],
  } as Profile;
  if (!appData) {
    appData = { profiles: [] };
  }
  appData.profiles.push(newProfile);
  writeAppData(appData);

  router.push("Dashboard");
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
