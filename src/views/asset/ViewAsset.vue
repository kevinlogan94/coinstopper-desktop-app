<template>
  <Card class="view-asset">
    <!-- Asset Name -->
    <template #title>
        <h1 class="text-2xl font-bold mb-4">{{ assetName }}</h1>
    </template>

    <template #content>
        <!-- Asset Summary -->
        <div class="asset-summary mb-6">
          <p><strong>Current Value:</strong> {{ formatNumber(currentValue, {currency: true}) }}</p>
          <p><strong>Total Holdings:</strong> {{ totalHoldings }}</p>
          <p><strong>Percentage Changed:</strong> {{ percentageChanged }}%</p>
        </div>
        <!-- Performance Metrics -->
        <div class="performance-metrics mb-6">
          <p><strong>Return on Investment (ROI):</strong> {{ roi }}%</p>
          <p>
            <strong>Net Profit/Loss:</strong> {{ formatNumber(netProfitLoss, {currency: true}) }}
          </p>
          <p>
            <strong>Average Buy Price:</strong>
            {{ formatNumber(averageBuyPrice, {currency: true}) }}
          </p>
          <p>
            <strong>Total Investment:</strong> {{ formatNumber(totalInvestment, {currency: true}) }}
          </p>
        </div>
        <!-- Transaction List -->
        <TransactionList    :transactions="transactions" />
    </template>

    <template #footer>
        <!-- Remove Button -->
        <div class="delete-button mt-6">
          <Button
            label="Remove Asset"
            class="p-button-danger"
            @click="goToRemoveAsset"
          />
        </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Card from "primevue/card";
import Button from "primevue/button";
import TransactionList from "@/components/portfolio/TransactionList.vue";
import router from "@/router";
import { getAllCoinbaseCryptoProductDataByProfileId } from "@/helpers/CoinbaseHelper";
import { getLedgerByProfileId } from "@/helpers/AppDataHelper";
import { Transaction } from "main/models";
import { formatNumber } from "@/filters/FormatNumber";

const props = defineProps<{ profileId: string; assetId: string }>();

// State variables
const assetName = ref("");
const currentValue = ref(0);
const totalHoldings = ref(0);
const percentageChanged = ref(0);
const roi = ref(0);
const netProfitLoss = ref(0);
const averageBuyPrice = ref(0);
const totalInvestment = ref(0);
const transactions = ref<Array<Transaction>>([]);

const goToRemoveAsset = () => {
  router.push({
    name: "removeAsset",
    params: { profileId: props.profileId, assetId: props.assetId },
  });
};

onMounted(async () => {
  const allAvailableCrypto = await getAllCoinbaseCryptoProductDataByProfileId(
    props.profileId
  );
  const asset = allAvailableCrypto.find((a) => a.product_id === props.assetId);

  if (asset) {
    assetName.value = asset.base_name;
    currentValue.value = asset.priceInUSD;
    totalHoldings.value = asset.balanceInCrypto;
    percentageChanged.value = asset.priceChangePercentage24h;
    // roi.value = asset.roi;
    // netProfitLoss.value = asset.net_profit_loss;
    // averageBuyPrice.value = asset.average_buy_price;
  } else {
    console.error("Missing Asset");
  }
  
  await organizeTrasactions();
});

const organizeTrasactions = async () => {
    var ledger = await getLedgerByProfileId(props.profileId);
    var assetLedger = ledger.filter(t => t.symbol === props.assetId);
    transactions.value = assetLedger;
}

</script>

<style scoped>
.view-asset {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.asset-summary p,
.performance-metrics p {
  margin: 0.5rem 0;
}
</style>
