<template>
    <Card class="center-card">
      <template #title> Edit Profile </template>
      <template #content>
        <form @submit.prevent="saveProfile" class="form-content">
          <p>Edit your profile information below.</p>
  
          <!-- Username -->
          <div class="form-group">
            <label for="username">Username</label>
            <InputText 
              id="username" 
              v-model="profile.username" 
              class="w-full" 
              placeholder="Enter your username" 
              required 
            />
          </div>
  
          <!-- API Key -->
          <div class="form-group">
            <label for="apiKey">API Key</label>
            <InputText 
              id="apiKey" 
              v-model="profile.apiKey" 
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
              v-model="profile.apiSecret" 
              toggleMask 
              class="w-full" 
              placeholder="Enter your API Secret" 
              required 
            />
          </div>
  
          <div class="card-footer">
            <Button type="submit" label="Save Changes" severity="success" />
            <Button type="button" label="Cancel" severity="secondary" @click="cancelEdit" />
          </div>
        </form>
      </template>
    </Card>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from "vue";
  import Card from "primevue/card";
  import InputText from "primevue/inputtext";
  import Password from "primevue/password";
  import Button from "primevue/button";
  import { useRouter, useRoute } from "vue-router";
  
  const profile = ref({
    username: "",
    apiKey: "",
    apiSecret: "",
  });
  
  const router = useRouter();
  const route = useRoute();
  const profileId = route.params.profileId as string;
  
  const getProfile = async (profileId: string): Promise<{ username: string; apiKey: string; apiSecret: string }> => {
    // Mocking the API call to fetch profile details
    return {
      username: "User123",
      apiKey: "abcd1234",
      apiSecret: "secretKey",
    };
  };
  
  const saveProfile = async () => {
    // Mocking the API call to save profile changes
    console.log("Profile saved:", profile.value);
    router.push({ name: "portfolio" });
  };
  
  const cancelEdit = () => {
    router.push({ name: "portfolio" });
  };
  
  onMounted(async () => {
    const fetchedProfile = await getProfile(profileId);
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
  