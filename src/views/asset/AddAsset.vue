<template>
  <Card class="center-card">
    <template #title> Add Asset </template>
    <template #content>
      <Steps
        :model="steps"
        v-model:activeStep="stepComponentStep"
        class="step-indicator"
      />

      <!-- Step 1: Add Asset -->
      <div v-if="currentStep === 1" class="step-content">
        <p>Select the assets you want to add to your portfolio.</p>
        <MultiSelect
          v-model="selectedAssets"
          :options="cryptoOptions"
          optionLabel="base_name"
          placeholder="Select Assets"
          filter
          class="w-full"
        />
      </div>

      <!-- Step 2: Finalize -->
      <div v-else-if="currentStep === 2" class="step-content">
        <p>Review and finalize the assets to add to your portfolio:</p>
        <ul>
          <li v-for="asset in selectedAssets" :key="asset.product_id">
            {{ asset.base_name }}
          </li>
        </ul>
      </div>
    </template>

    <template #footer>
      <div class="card-footer">
        <Button
          v-if="currentStep > 1"
          label="Back"
          severity="secondary"
          @click="goToStep(currentStep - 1)"
        />
        <Button
          v-if="currentStep < steps.length"
          label="Next"
          :disabled="currentStep === 1 && selectedAssets.length === 0"
          @click="goToStep(currentStep + 1)"
        />
        <Button
          v-if="currentStep === steps.length"
          label="Submit"
          severity="success"
          @click="finalizeAssets"
        />
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, defineProps, computed, onMounted } from "vue";
import Button from "primevue/button";
import Card from "primevue/card";
import Steps from "primevue/steps";
import MultiSelect from "primevue/multiselect";
import { getAllCoinbaseCryptoProductDataByProfileId } from "@/helpers/CoinbaseHelper";
import router from "@/router";

const props = defineProps<{ profileId: string }>();

const currentStep = ref(1);
const selectedAssets = ref([]);
const cryptoOptions = ref([]);

const stepComponentStep = computed(() => currentStep.value - 1);
const steps = [{ label: "Add Asset" }, { label: "Finalize" }];

const goToStep = (step: number) => {
  currentStep.value = step;
};

const finalizeAssets = () => {
    console.log(cryptoOptions.value);
    
//   updateProfile(props.profileId, (profile) => {
//     profile.trackerConfig.whiteList.push(...cryptoOptions.value);
//   });
  router.push({ name: "portfolio", params: { profileId: "12345" } });
};

onMounted(async () => {
    console.log(router.currentRoute.value);
    
    console.log(props.profileId);
    
  cryptoOptions.value = await getAllCoinbaseCryptoProductDataByProfileId(props.profileId);
});
</script>

<style scoped>
.center-card {
  margin: auto;
  max-width: 500px;
}
.step-indicator {
  margin-bottom: 1rem;
}
.step-content {
  margin-top: 1rem;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}
</style>
