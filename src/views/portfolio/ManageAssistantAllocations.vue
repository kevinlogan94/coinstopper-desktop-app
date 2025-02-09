<template>
  <Card class="manage-allocations">
    <template #title>
      {{ action === "allocate" ? "Allocate to Assistant" : "Withdraw from Assistant" }}
    </template>

    <template #content>

      <!-- Step 1: Allocate or Withdraw from Assistant -->
      <div v-if="currentStep === 0" class="step-content">
        <p>
          {{
            action === "allocate"
              ? `Enter the amount you want to allocate to the assistant. You have $${buyingPower} available.`
              : `Enter the amount you want to withdraw from the assistant.`
          }}
        </p>
        <InputNumber
          v-model="amount"
          mode="currency"
          currency="USD"
          placeholder="$0.00"
          class="w-full"
          :min="action === 'allocate' ? 0 : 0"
          :max="action === 'allocate' ? buyingPower : balanceHeldByAssistant"
        />
        <small v-if="action === 'allocate'" class="text-gray-500">
          Maximum you can allocate:
          {{ formatNumber(buyingPower, { currency: true }) }}
        </small>
        <small v-if="action === 'withdraw'" class="text-gray-500">
          Maximum you can withdraw:
          {{ formatNumber(balanceHeldByAssistant, { currency: true }) }}
        </small>
      </div>

      <!-- Step 2: Finalize -->
      <div v-if="currentStep === 1" class="step-content">
        <p>
          {{
            action === "allocate"
              ? "You are about to allocate:"
              : "You are about to withdraw:"
          }}
          <strong>{{ formatNumber(amount, { currency: true }) }}</strong>
        </p>
        <p>
          {{
            action === "allocate"
              ? "With this change, your smart assistant will have "
              : "With this change, your available funds will be "
          }}
          <strong>{{
            action === "allocate"
              ? formatNumber(balanceHeldByAssistant + amount, {
                  currency: true,
                })
              : formatNumber(newBuyingPower, { currency: true })
          }}</strong>
        </p>
        <p>Do you want to proceed?</p>
      </div>
      <div>
        <Button
            v-if="currentStep > 0"
            label="Back"
            class="p-button-secondary"
            @click="goToStep(currentStep - 1)"
          />
          <Button
            v-if="currentStep < steps.length - 1"
            label="Next"
            :disabled="
              currentStep === 0 && (!amount || amount <= 0 || amount > maxAmount)
            "
            @click="goToStep(currentStep + 1)"
          />
          <Button
            v-if="currentStep === steps.length - 1"
            label="Finalize"
            class="p-button-success"
            @click="finalize"
          />
      </div>
    </template>

    <template #footer>
      <Steps :model="steps" v-model:activeStep="currentStep" class="mb-4" />
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import Card from "primevue/card";
import Button from "primevue/button";
import Steps from "primevue/steps";
import InputNumber from "primevue/inputnumber";
import router from "@/router";
import { ConvertStringToNumber, formatNumber } from "@/filters/FormatNumber";
import {
  getBuyingMetrics,
  getRawBuyingMetrics,
  RawBuyingMetrics,
} from "@/helpers/Helpers";
import { addToLedger, getLedgerByProfileId } from "@/helpers/AppDataHelper";
import { Transaction } from "main/models";

const props = defineProps<{ profileId: string; action: "allocate" | "withdraw" }>();

const currentStep = ref(0);
const amount = ref<number | null>(null);
const buyingPower = ref(0);
const balanceHeldByAssistant = ref(0);
const rawBuyingMetrics = ref<RawBuyingMetrics>();

const steps = [
  { label: props.action === "allocate" ? "Allocate to Assistant" : "Withdraw from Assistant" },
  { label: "Finalize" },
];

const goToStep = (step: number) => {
  currentStep.value = step;
};

const newBuyingPower = computed(() => {
  return Math.max(
    rawBuyingMetrics.value.coinbaseBalance -
      (rawBuyingMetrics.value.moneyHeldByAssistant - amount.value),
    0
  );
});

const finalize = () => {
  console.log(
    `${props.action === "allocate" ? "Allocated" : "Withdrawn"} ${
      amount.value
    } to/from profile ${props.profileId}`
  );
  AddActionToLedger(
    amount.value,
    props.action === "allocate" ? "deposit" : "withdraw"
  );
  router.push({ name: "portfolio", params: { profileId: props.profileId } });
};

const maxAmount = computed(() => {
  return props.action === "allocate"
    ? buyingPower.value
    : balanceHeldByAssistant.value;
});

onMounted(async () => {
  var buyingMetrics = await getBuyingMetrics(props.profileId);
  buyingPower.value = ConvertStringToNumber(buyingMetrics.buyingPower);
  balanceHeldByAssistant.value = ConvertStringToNumber(
    buyingMetrics.moneyHeldByAssistant
  );
  if (props.action === "withdraw") {
    rawBuyingMetrics.value = await getRawBuyingMetrics(props.profileId);
  }
});

const AddActionToLedger = async (
  amount: number,
  action: "deposit" | "withdraw"
): Promise<void> => {
  const ledger = await getLedgerByProfileId(props.profileId);
  const balance = ledger[ledger.length - 1]?.balance || 0; // Default to 0 if the ledger is empty

  const isDeposit = action === "deposit";

  const ledgerAddition: Transaction = {
    timestamp: new Date().toISOString(), // Use ISO format for timestamps
    amount: isDeposit ? amount : -amount, // Negative for deposits, positive for withdrawals
    symbol: "N/A", // Default symbol
    description: isDeposit ? "Deposit" : "Withdraw", // Description based on action
    balance: isDeposit ? balance + amount : balance - amount, // Adjust balance based on action
  };

  await addToLedger(props.profileId, ledgerAddition);
};
</script>

<style scoped>
.manage-allocations {
  max-width: 500px;
  margin: 0 auto;
  padding: 1rem;
}

.step-content {
  margin-bottom: 1.5rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}
</style>
