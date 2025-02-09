<template>
  <Card class="view-crypto">
    <!-- Crypto Name -->
    <template #title>
      <div class="flex justify-content-between">
        <h1 class="text-2xl font-bold m-0 mb-1">{{ crypto?.base_name }}</h1>
        <Button
          :label="autoBuy ? 'Auto Buying: Running' : 'Auto Buying: Paused'"
          :icon="autoBuy ? 'pi pi-pause' : 'pi pi-play'"
          :severity="autoBuy ? 'success' : 'warning'"
          @click="toggleAutoBuying"
        ></Button>
      </div>
    </template>

    <template #content>
      <!-- Crypto Summary -->
      <!-- <div class="crypto-summary mb-6">
        <p>
          <strong>Current Value:</strong>
          {{ formatNumber(currentValue, { currency: true }) }}
        </p>
        <p><strong>Total Holdings:</strong> {{ totalHoldings }}</p>
        <p><strong>Percentage Changed:</strong> {{ percentageChanged }}%</p>
      </div> -->
      <div class="flex flex-wrap gap-3 justify-content-between mb-3">
        <Card v-for="kpi in kpis" :key="kpi.label" class="kpi-card flex-1">
          <template #content>
            <p class="text-sm text-color-secondary">{{ kpi.label }}</p>
            <p
              class="text-lg font-bold"
              :class="{
                'text-green-500': !kpi.value.toString().includes('-'),
                'text-red-500': kpi.value.toString().includes('-'),
              }"
            >
              {{ kpi.value }}
            </p>
          </template>
        </Card>
      </div>
      <!-- Position List -->
      <PositionList
        :coin-symbol="crypto?.base_name"
        :positions="cryptoMetrics?.positions"
      />
    </template>

    <template #footer>
      <!-- Remove Button -->
      <div class="delete-button mt-6">
        <Button
          label="Remove Crypto"
          class="p-button-danger"
          @click="goToRemoveCrypto"
        />
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Card from "primevue/card";
import Button from "primevue/button";
import router from "@/router";
import { getAllCoinbaseCryptoProductDataByProfileId } from "@/helpers/CoinbaseHelper";
import { formatNumber } from "@/filters/FormatNumber";
import PositionList from "@/components/crypto/PositionList.vue";
import { getTrackerMetricsByProfileId } from "@/helpers/ElectronHelper";
import { CoinTrackerMetrics } from "main/services/trackerFileManager";
import { CryptoDetails } from "main/services/coinbase";
import { LabelValuePair } from "@/models";

const props = defineProps<{ profileId: string; cryptoId: string }>();

const autoBuy = ref(true);

const cryptoMetrics = ref<CoinTrackerMetrics>();
const crypto = ref<CryptoDetails>();
const kpis = ref<Array<LabelValuePair>>([]);

const goToRemoveCrypto = () => {
  router.push({
    name: "removeCrypto",
    params: { profileId: props.profileId, cryptoId: props.cryptoId },
  });
};

const toggleAutoBuying = () => {
  //toggle auto buying
};

onMounted(async () => {
  organizeCrypto();
  organizeTrackerFileConfig();
});

const organizeCrypto = async () => {
  const allAvailableCrypto = await getAllCoinbaseCryptoProductDataByProfileId(
    props.profileId
  );
  crypto.value = allAvailableCrypto.find(
    (a) => a.product_id === props.cryptoId
  );
};

const organizeTrackerFileConfig = async () => {
  const trackerMetrics = await getTrackerMetricsByProfileId(props.profileId);
  cryptoMetrics.value = trackerMetrics.individualCoinMetrics[props.cryptoId];

  if (!cryptoMetrics.value) return;

  kpis.value = [
    {
      label: "Total Profit/Loss",
      value:
        cryptoMetrics.value?.plAmount != 0
          ? formatNumber(cryptoMetrics.value.plAmount, { currency: true })
          : "N/A",
    },
    {
      label: "Profit/Loss Percentage",
      value:
        cryptoMetrics.value.plPercentage != 0
          ? formatNumber(cryptoMetrics.value.plPercentage, { percentage: true })
          : "N/A",
    },
    {
      label: "Held By Assistant",
      value: formatNumber(cryptoMetrics.value.heldValueUsd, { currency: true }),
    },
    {
      label: "Total Invested",
      value:
        cryptoMetrics.value.totalInvested != 0
          ? formatNumber(cryptoMetrics.value.totalInvested, {
              currency: true,
            })
          : "N/A",
    },
  ];
};
</script>

<style scoped>
.view-crypto {
  min-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.crypto-summary p,
.performance-metrics p {
  margin: 0.5rem 0;
}
</style>
