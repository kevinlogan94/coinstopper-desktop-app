<template>
  <Dialog
    :visible="visible"
    modal
    :closable="false"
    class="w-7"
    @hide="closeModal"
    @show="setupModal"
    :header="getHeader"
  >
    <!-- Step 1: Setup Smart Trading Assistant -->
    <div v-if="currentStep === 1" class="modal-content">
      <div class="modal-body">
        <p>
          Your Smart Trading Assistant is an automated trading system that
          actively manages your investments based on market conditions. Instead
          of manually choosing and timing trades, you allocate funds to the
          assistant, and it buys, sells, and optimizes your portfolio for you.
        </p>
        <p>Here is how it works:</p>
        <ul>
          <li>
            Monitors the market in real-time to identify trading opportunities.
          </li>
          <li>Automatically executes trades based on proven strategies.</li>
          <li>Manages risk and adjusts positions to optimize performance.</li>
          <li>
            Keeps full transparency - you can monitor every trade and withdraw
            at any time.
          </li>
        </ul>
        <p>Your Smart Trading Assistant is Ready!</p>
      </div>
      <div class="modal-actions">
        <Button label="Next" @click="goToStep(2)" />
      </div>
    </div>

    <!-- Step 2: Add Initial Investment -->
    <div v-else-if="currentStep === 2" class="modal-content">
      <div class="modal-body">
        <p>How much do you want to allocate for your assistant to manage?</p>

        <p>
          You have
          <strong>{{
            formatNumber(coinbaseBalance, { currency: true })
          }}</strong>
          in USDC<i
            class="ml-1 text-primary pi pi-info-circle"
            v-tooltip="
              'Currently, we only accept USDC (USD Coin) for allocations. If you don\'t have USDC, you may need to convert funds first.'
            "
            style="cursor: pointer"
          ></i>
          available.
        </p>

        <InputNumber
          v-model="investmentAmount"
          :min="0"
          :max="coinbaseBalance"
          currency="USD"
          mode="currency"
          placeholder="$0.00"
        />
      </div>
      <div class="modal-actions">
        <Button label="Back" severity="secondary" @click="goToStep(1)" />
        <Button
          label="Next"
          :disabled="!investmentAmount"
          @click="goToStep(3)"
        />
      </div>
    </div>

    <!-- Step 3: Choose Cryptocurrency -->
    <div v-else-if="currentStep === 3" class="modal-content">
      <div class="modal-body">
        <p>Choose a cryptocurrency to start with.</p>

        <Dropdown
          v-model="selectedCrypto"
          :options="cryptoOptions"
          optionLabel="label"
          filter
          placeholder="Select Cryptocurrency"
        />

        <small class="block mt-2 text-sm text-500">
          You can add more cryptocurrencies anytime.
        </small>
      </div>
      <div class="modal-actions">
        <Button label="Back" severity="secondary" @click="goToStep(2)" />
        <Button
          label="Next"
          :disabled="!selectedCrypto"
          @click="goToStep(4)"
        />
      </div>
    </div>

    <!-- Step 4: Confirmation -->
    <div v-else-if="currentStep === 4" class="modal-content">
      <div class="modal-body">
        <p>
          You're all set! Here's a summary of your setup. If everything looks
          good, start trading now. You can always adjust these settings later.
        </p>
        <ul>
          <li><strong>Smart Assistant:</strong> Enabled (Default)</li>
          <li>
            <strong>Assistant Allocations:</strong> ${{ investmentAmount }}
          </li>
          <li><strong>Cryptocurrency:</strong> {{ selectedCrypto.label }}</li>
        </ul>
      </div>
      <div class="modal-actions">
        <Button
          label="Back"
          class="p-button-secondary"
          @click="goToStep(3)"
        />
        <Button
          label="Start Trading"
          severity="success"
          @click="finishSetup"
        />
      </div>
    </div>

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
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Steps from "primevue/steps";
import { updateProfile } from "@/helpers/AppDataHelper";
import { Profile } from "main/models";
import {
  getAllCoinbaseCryptoProductDataByProfileId,
  getCoinbaseBalanceByProfileId,
} from "@/helpers/CoinbaseHelper";
import { formatNumber } from "@/filters/FormatNumber";
import { startTradingAssistant } from "@/helpers/ElectronHelper";

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  currentPrice: {
    type: Number,
    default: 0,
  },
  profileId: {
    type: String,
  },
});

const emits = defineEmits(["close", "setupCompleted"]);

const currentStep = ref(1);
const selectedCrypto = ref<{ label: string; value: string }>({
  label: "Bitcoin",
  value: "BTC-USDC",
});
const investmentAmount = ref(0);
const stepComponentStep = computed(() => currentStep.value - 1);
const cryptoOptions = ref([]);
const coinbaseBalance = ref(0);

const steps = [
  { label: "Set up" },
  { label: "Allocate USDC" },
  { label: "Choose Crypto" },
  { label: "Review & Start" },
];

const getHeader = computed(() => {
  switch (currentStep.value) {
    case 1:
      return "Meet Your Smart Trading Assistant";
    case 2:
      return "Allocate USDC to your Assistant";
    case 3:
      return "Select Your First Cryptocurrency";
    case 4:
      return "Review & Start Trading";
    default:
      return "";
  }
});

const goToStep = (step: number) => {
  currentStep.value = step;
};

const finishSetup = async () => {
  updateProfile(props.profileId, (profile: Profile) => {
    profile.appConfig.trackerEnabled = true;
    profile.trackerConfig.initialDeposit = investmentAmount.value;
    profile.trackerConfig.whiteList = [selectedCrypto.value.value];
  });

  await startTradingAssistant(props.profileId);

  closeModal();
};

const setupModal = async () => {
  organizeCryptoOptions();
  organizeCoinbaseBalance();
};

const organizeCryptoOptions = async () => {
  const crypto = await getAllCoinbaseCryptoProductDataByProfileId(
    props.profileId
  );
  cryptoOptions.value = crypto.map((c) => ({
    label: c.base_name,
    value: c.product_id,
  }));
};

const organizeCoinbaseBalance = async () => {
  const balance = await getCoinbaseBalanceByProfileId(props.profileId);
  coinbaseBalance.value = balance;
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

.modal-content {
  margin: 1rem;
}
</style>
