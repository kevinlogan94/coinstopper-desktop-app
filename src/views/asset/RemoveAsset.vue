<template>
  <Card class="center-card">
    <template #title> Remove Asset </template>
    <template #content>
      <Steps
        :model="steps"
        v-model:activeStep="stepComponentStep"
        class="step-indicator"
      />

      <!-- Step 1: Select Asset to Remove -->
      <div v-if="currentStep === 1" class="step-content">
        <p>Select the asset you want to remove from your portfolio.</p>
        <Dropdown
          v-model="selectedAsset"
          :options="cryptoOptions"
          optionLabel="base_name"
          placeholder="Select Asset"
          filter
          class="w-full"
        />
      </div>

      <!-- Step 2: Finalize -->
      <div v-else-if="currentStep === 2" class="step-content">
        <p>Review and finalize the asset to remove from your portfolio:</p>
        <ul>
          <li>{{ selectedAsset.base_name }}</li>
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
          :disabled="currentStep === 1 && !selectedAsset"
          @click="goToStep(currentStep + 1)"
        />
        <Button
          v-if="currentStep === steps.length"
          label="Submit"
          severity="danger"
          @click="finalizeRemoval"
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
import Dropdown from "primevue/dropdown";
import { useRouter } from "vue-router";
import { getProfile, updateProfile } from "@/helpers/AppDataHelper";
import { getAllCoinbaseCryptoByProfileId } from "@/helpers/CoinbaseHelper";

const props = defineProps<{ profileId: string; assetId: string }>();
const router = useRouter();

const currentStep = ref(1);
const selectedAsset = ref(null);
const cryptoOptions = ref([]);

const stepComponentStep = computed(() => currentStep.value - 1);
const steps = [{ label: "Select Asset" }, { label: "Finalize" }];

const goToStep = (step: number) => {
  currentStep.value = step;
};

const finalizeRemoval = () => {
  console.log("SelectedAsset", selectedAsset.value);

//   updateProfile(props.profileId, (profile) => {
//     profile.trackerConfig.whiteList = profile.trackerConfig.whiteList.filter(
//       (item) => item !== selectedAsset.value
//     );
//   });
  router.push({ name: "portfolio", params: { profileId: props.profileId } });
};

onMounted(async () => {
  const profile = await getProfile(props.profileId);
  const allCryptos = await getAllCoinbaseCryptoByProfileId(props.profileId);
  const whitelist = profile.trackerConfig.whitelist;
  cryptoOptions.value = allCryptos.filter((asset) =>
    whitelist.includes(asset.product_id)
  );
  selectedAsset.value =
    cryptoOptions.value.find((asset) => asset.product_id === props.assetId) ||
    null;
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
