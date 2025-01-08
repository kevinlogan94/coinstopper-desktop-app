<template>
    <div class="welcome-screen flex justify-content-center align-items-center h-screen">
      <div class="welcome-card p-4 shadow-2 border-round bg-gray-900">
        <!-- App Logo -->
        <div class="logo flex justify-content-center mb-3">
          <img src="/img/logo.png" alt="Coin Stopper Logo" class="logo-img" />
        </div>
  
        <!-- Welcome Title -->
        <h1 class="text-center text-white mb-4">Welcome to Coin Stopper</h1>
  
        <!-- Create Profile Button -->
        <Button
          label="Create Profile"
          class="button-success w-full"
          @click="onCreateProfile"
        />
  
        <!-- Footer (Version Info) -->
        <footer class="text-center mt-4">
          <p class="text-sm text-gray-400">Version {{ version }}</p>
        </footer>
      </div>
    </div>
  </template>

<script setup lang="ts">
// Import PrimeVue Button Component
import Button from "primevue/button";

// Import package.json to dynamically fetch the app version
import packageInfo from "../../package.json";

// Reactive state for the app version
const version: string = packageInfo.version;

// Method to handle "Create Profile" button click
const onCreateProfile = (): void => {
  console.log("Navigating to Create Profile");
  // Add navigation or action logic here
};
</script>

<style lang="scss">
$primary-color: #42b983;
/* Fullscreen layout for the welcome screen */
.welcome-screen {
  background: linear-gradient(135deg, $primary-color, #1a1f3c); /* Subtle gradient */
  color: #fff; /* Default text color */
}

/* Logo Styling */
.logo-img {
  width: 80px;
  height: auto;
}

/* Card Styling (customized for visual appeal) */

</style>