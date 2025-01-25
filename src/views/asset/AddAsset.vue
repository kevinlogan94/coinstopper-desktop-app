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
          optionLabel="label"
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
            {{ asset.label }}
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
import { getProfile, updateProfile } from "@/helpers/AppDataHelper";

const props = defineProps<{ profileId: string }>();

const currentStep = ref(1);
const selectedAssets = ref([]);
const cryptoOptions = ref([]);

const stepComponentStep = computed(() => currentStep.value - 1);
const steps = [{ label: "Add Asset" }, { label: "Finalize" }];

const goToStep = (step: number) => {
  currentStep.value = step;
};

const finalizeAssets = async () => {
  const whiteListAdditions = selectedAssets.value.map((x) => x.value);

  await updateProfile(props.profileId, (profile) => {
    profile.trackerConfig.whiteList.push(...whiteListAdditions);
  });
  router.push({ name: "portfolio", params: { profileId: props.profileId } });
};

onMounted(async () => {
  const profile = await getProfile(props.profileId);
  const whiteList = profile.trackerConfig.whiteList;

  const allCryptoOptions = await getAllCoinbaseCryptoProductDataByProfileId(
    props.profileId
  );
  cryptoOptions.value = allCryptoOptions
    .filter((crypto) => !whiteList.includes(crypto.product_id))
    .map((crypto) => ({ label: crypto.base_name, value: crypto.product_id }));
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
