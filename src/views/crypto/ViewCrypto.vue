<template>
  <Card class="view-crypto">
    <!-- Crypto Name -->
    <template #title>
      <h1 class="text-2xl font-bold mb-4">{{ cryptoName }}</h1>
    </template>

    <template #content>
      <!-- Crypto Summary -->
      <div class="crypto-summary mb-6">
        <p>
          <strong>Current Value:</strong>
          {{ formatNumber(currentValue, { currency: true }) }}
        </p>
        <p><strong>Total Holdings:</strong> {{ totalHoldings }}</p>
        <p><strong>Percentage Changed:</strong> {{ percentageChanged }}%</p>
      </div>
      <!-- Performance Metrics -->
      <div class="performance-metrics mb-6">
        <p><strong>Return on Investment (ROI):</strong> {{ roi }}%</p>
        <p>
          <strong>Net Profit/Loss:</strong>
          {{ formatNumber(netProfitLoss, { currency: true }) }}
        </p>
        <p>
          <strong>Average Buy Price:</strong>
          {{ formatNumber(averageBuyPrice, { currency: true }) }}
        </p>
        <p>
          <strong>Total Investment:</strong>
          {{ formatNumber(totalInvestment, { currency: true }) }}
        </p>
      </div>
      <!-- Position List -->
      <PositionList
        v-if="cryptoMetrics"
        :coin-symbol="crypto.base_name"
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

const props = defineProps<{ profileId: string; cryptoId: string }>();

// State variables
const cryptoName = ref("");
const currentValue = ref(0);
const totalHoldings = ref(0);
const percentageChanged = ref(0);
const roi = ref(0);
const netProfitLoss = ref(0);
const averageBuyPrice = ref(0);
const totalInvestment = ref(0);
const cryptoMetrics = ref<CoinTrackerMetrics>();
const crypto = ref<CryptoDetails>();

const goToRemoveCrypto = () => {
  router.push({
    name: "removeCrypto",
    params: { profileId: props.profileId, cryptoId: props.cryptoId },
  });
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

  if (crypto.value) {
    cryptoName.value = crypto.value.base_name;
    currentValue.value = crypto.value.priceInUSD;
    totalHoldings.value = crypto.value.balanceInCrypto;
    percentageChanged.value = crypto.value.priceChangePercentage24h;
    // roi.value = crypto.roi;
    // netProfitLoss.value = crypto.net_profit_loss;
    // averageBuyPrice.value = crypto.average_buy_price;
  } else {
    console.error("Missing Crypto");
  }
};

const organizeTrackerFileConfig = async () => {
  const trackerMetrics = await getTrackerMetricsByProfileId(props.profileId);
  cryptoMetrics.value = trackerMetrics.individualCoinMetrics[props.cryptoId];
};
</script>

<style scoped>
.view-crypto {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.crypto-summary p,
.performance-metrics p {
  margin: 0.5rem 0;
}
</style>
