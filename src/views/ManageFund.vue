<template>
  <Card class="manage-fund">
    <template #title>
      Manage Fund - {{ action === "add" ? "Add Funds" : "Remove Funds" }}
    </template>

    <template #content>
      <Steps :model="steps" v-model:activeStep="currentStep" class="mb-4" />

      <!-- Step 1: Add or Remove Funds -->
      <div v-if="currentStep === 0" class="step-content">
        <p>
          {{
            action === "add"
              ? `Enter the amount you want to add to the fund. You have $${buyingPower} available.`
              : `Enter the amount you want to remove from the fund.`
          }}
        </p>
        <InputNumber
          v-model="amount"
          mode="currency"
          currency="USD"
          placeholder="$0.00"
          class="w-full"
          :min="action === 'add' ? 0 : 0"
          :max="action === 'add' ? buyingPower : balanceHeldByAssistant"
        />
        <small v-if="action === 'add'" class="text-gray-500">
          Maximum you can add:
          {{ formatNumber(buyingPower, { currency: true }) }}
        </small>
        <small v-if="action === 'remove'" class="text-gray-500">
          Maximum you can remove:
          {{ formatNumber(balanceHeldByAssistant, { currency: true }) }}
        </small>
      </div>

      <!-- Step 2: Finalize -->
      <div v-if="currentStep === 1" class="step-content">
        <p>
          {{
            action === "add"
              ? "You are about to add:"
              : "You are about to remove:"
          }}
          <strong>{{ formatNumber(amount, { currency: true }) }}</strong>
        </p>
        <p>Do you want to proceed?</p>
      </div>
    </template>

    <template #footer>
      <div class="card-footer">
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
import { getBuyingMetrics } from "@/helpers/Helpers";

const props = defineProps<{ profileId: string; action: "add" | "remove" }>();

const currentStep = ref(0);
const amount = ref<number | null>(null);
const buyingPower = ref(0);
const balanceHeldByAssistant = ref(0);

const steps = [
  { label: props.action === "add" ? "Add Funds" : "Remove Funds" },
  { label: "Finalize" },
];

const goToStep = (step: number) => {
  currentStep.value = step;
};

const finalize = () => {
  // Mocked finalize action - Normally you would call an API here
  console.log(
    `${props.action === "add" ? "Added" : "Removed"} ${
      amount.value
    } to/from profile ${props.profileId}`
  );
  router.push({ name: "portfolio", params: { profileId: props.profileId } });
};

const maxAmount = computed(() => {
  return props.action === "add"
    ? buyingPower.value
    : balanceHeldByAssistant.value;
});

onMounted(async () => {
  var buyingMetrics = await getBuyingMetrics(props.profileId);
  buyingPower.value = ConvertStringToNumber(buyingMetrics.buyingPower);
  balanceHeldByAssistant.value = ConvertStringToNumber(
    buyingMetrics.moneyHeldByAssistant
  );
});
</script>

<style scoped>
.manage-fund {
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
