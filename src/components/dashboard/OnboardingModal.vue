<template>
    <Dialog 
      :visible="visible" 
      :modal="true" 
      :closable="false" 
      header="Welcome to Your Portfolio"
      class="w-7"
      @hide="closeModal"
    >
      <!-- Step 1: Choose Cryptocurrency -->
      <Card v-if="currentStep === 1" class="modal-card">
        <template #title>
          Select Your First Cryptocurrency
        </template>
        <template #content>
          <p>Choose the cryptocurrency you'd like to start investing in.</p>
          
          <Dropdown 
            v-model="selectedCrypto" 
            :options="cryptoOptions" 
            optionLabel="label"
            filter
            placeholder="Select Cryptocurrency" 
          />

          <small class="block mt-2 text-sm text-500">
          Don't worry, you can always add more cryptocurrencies later!
        </small>
        </template>
        <template #footer>
          <div class="modal-actions">
            <Button label="Next" :disabled="!selectedCrypto" @click="goToStep(2)" />
          </div>
        </template>
      </Card>
  
      <!-- Step 2: Add Initial Investment -->
      <Card v-else-if="currentStep === 2" class="modal-card">
        <template #title>
          Add Your Initial Investment
        </template>
        <template #content>
          <p>Enter the amount you've invested in {{ selectedCrypto.label }}.</p>
          
          <InputNumber 
            v-model="investmentAmount" 
            :min="0" 
            currency="USD" 
            mode="currency" 
            placeholder="$0.00" 
          />
        </template>
        <template #footer>
          <div class="modal-actions">
            <Button label="Back" severity="secondary" @click="goToStep(1)" />
            <Button label="Next" :disabled="!investmentAmount" @click="goToStep(3)" />
          </div>
        </template>
      </Card>
  
      <!-- Step 3: Enable Smart Trading Assistant -->
      <Card v-else-if="currentStep === 3" class="modal-card">
        <template #title>
          Enable Smart Trading Assistant
        </template>
        <template #content>
          <p>
            The Smart Trading Assistant will monitor the market, perform trades on your behalf, and optimize your portfolio.
          </p>
          <p>Enable it now to let your investments grow automatically!</p>
          <Checkbox v-model="enableTracker" input-id="enableTracker" name="Enable Smart Trading Assistant" :binary="true"/>
          <label for="enableTracker"> Enable Smart Trading Assistant </label>
        </template>
        <template #footer>
          <div class="modal-actions">
            <Button label="Back" class="p-button-secondary" @click="goToStep(2)" />
            <Button label="Finalize" @click="goToStep(4)" />
          </div>
        </template>
      </Card>
  
      <!-- Step 4: Confirmation -->
      <Card v-else-if="currentStep === 4" class="modal-card">
        <template #title>
          You're All Set!
        </template>
        <template #content>
          <p>Here's a summary of your initial setup:</p>
          <ul>
            <li><strong>Cryptocurrency:</strong> {{ selectedCrypto.label }}</li>
            <li><strong>Investment Amount:</strong> ${{ investmentAmount }}</li>
            <li><strong>Smart Trading Assistant:</strong> {{ enableTracker ? "Enabled" : "Disabled" }}</li>
          </ul>
          <p>You can now start tracking your investments and monitoring their performance in real-time.</p>
        </template>
        <template #footer>
          <div class="modal-actions">
            <Button label="Back" class="p-button-secondary" @click="goToStep(3)" />
            <Button label="Submit" severity="success" @click="finishSetup" />
          </div>
        </template>
      </Card>
      <Steps 
      :model="steps" 
      v-model:activeStep="stepComponentStep"
      class="step-indicator"
    />
    </Dialog>
  </template>
  
  <script setup lang="ts">
  import { ref, defineProps, defineEmits, computed } from "vue";
  import Dropdown from "primevue/dropdown";
  import InputNumber from "primevue/inputnumber";
  import Checkbox from "primevue/checkbox";
  import Button from "primevue/button";
  import Card from "primevue/card";
  import Dialog from "primevue/dialog";
  import Steps from "primevue/steps";
import { updateProfile } from "@/helpers/appDataHelper";
import { Profile } from "main/models";
  
  const props = defineProps({
    visible: {
      type: Boolean,
      required: true,
    },
    currentPrice: {
      type: Number,
      default: 0,
    },
  });
  
  const emits = defineEmits(["close", "setupCompleted"]);
  
  const currentStep = ref(1);
  const selectedCrypto = ref<{label:string, value:string}>(null);
  const investmentAmount = ref(0);
  const enableTracker = ref(false);
  const stepComponentStep = computed(() => currentStep.value - 1);

  const cryptoOptions = [
    { label: "Bitcoin", value: "BTC" },
    { label: "Ethereum", value: "ETH" },
    { label: "Litecoin", value: "LTC" },
    
  ];

  const steps = [
  { label: "Choose Crypto" },
  { label: "Add Investment" },
  { label: "Enable Assistant" },
  { label: "Finish" },
];
  
  const goToStep = (step: number) => {
    currentStep.value = step;
  };
  
  const finishSetup = async () => {
    updateProfile("1", (profile: Profile) => {
        profile.appConfig.trackerEnabled = enableTracker.value;
        profile.trackerConfig.initialDeposit = investmentAmount.value;
        profile.trackerConfig.whiteList = [selectedCrypto.value.value]
    });

    closeModal();
  };
  
  const closeModal = () => {
    emits("close");
  };
  </script>
  
  <style scoped>
  .modal-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
  }

  .p-card {
    box-shadow: none;
    margin: 0;
  }
  </style>
  