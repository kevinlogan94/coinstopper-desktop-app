<template>
  <div
    class="welcome-screen flex justify-content-center align-items-center h-screen"
  >
    <div class="welcome-card p-4 shadow-2 border-round bg-gray-900">
      <h2>User Registration</h2>
      <form @submit.prevent="CreateProfile">
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
    </div>
  </div>
</template>

<script lang="ts" setup>
import router from "@/router";
import { writeAppData } from "@/utility";
import { AppData } from "main/models";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { reactive } from "vue";

const formData = reactive({
  username: "",
});

const CreateProfile = async () => {
  const appData = {
    profiles: [
      {
        id: "1",
        name: formData.username,
        credentials: [{ id: "1", platform: "coinbase" }],
      },
    ],
  } as AppData;
  writeAppData(appData);

  router.push("Dashboard");
};
</script>
