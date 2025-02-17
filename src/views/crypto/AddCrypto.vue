<template>
  <Card class="center-card">
    <template #title> Add Cryptocurrency </template>
    <template #content>

      <!-- Step 1: Add Crypto -->
      <div v-if="currentStep === 1" class="step-content">
        <p>Select the cryptocurrency you want your assistant to manage.</p>
        <MultiSelect
          v-model="selectedCryptos"
          :options="cryptoOptions"
          optionLabel="label"
          placeholder="Select Crypto"
          filter
          class="w-full"
        />
      </div>

      <!-- Step 2: Finalize -->
      <div v-else-if="currentStep === 2" class="step-content">
        <p>Review and finalize the cryptocurrencies to add to your portfolio:</p>
        <ul>
          <li v-for="crypto in selectedCryptos" :key="crypto.value">
            {{ crypto.label }}
          </li>
        </ul>
      </div>

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
          :disabled="currentStep === 1 && selectedCryptos.length === 0"
          @click="goToStep(currentStep + 1)"
        />
        <Button
          v-if="currentStep === steps.length"
          label="Submit"
          severity="success"
          @click="finalizeCryptos"
        />
      </div>
    </template>

    <template #footer>
      <Steps
        :model="steps"
        v-model:activeStep="stepComponentStep"
        class="step-indicator"
      />
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
import { createNewTrackerFile } from "@/helpers/TrackerFileHelper";
import { LabelValuePair } from "@/models";

const props = defineProps<{ profileId: string }>();

const currentStep = ref(1);
const selectedCryptos = ref<Array<LabelValuePair>>([]);
const cryptoOptions = ref<Array<LabelValuePair>>([]);

const stepComponentStep = computed(() => currentStep.value - 1);
const steps = [{ label: "Add Crypto" }, { label: "Finalize" }];

const goToStep = (step: number) => {
  currentStep.value = step;
};

const finalizeCryptos = async () => {
  const whiteListAdditions = selectedCryptos.value.map((x) => x.value);

  await updateProfile(props.profileId, (profile) => {
    profile.trackerConfig.whiteList.push(...whiteListAdditions);
  });
  for (const selectedCrypto of selectedCryptos.value) {
    await createNewTrackerFile(props.profileId, selectedCrypto.value);
  }
  
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
