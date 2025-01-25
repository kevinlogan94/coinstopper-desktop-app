<template>
  <Card class="view-asset">
    <!-- Asset Name -->
    <h1 class="text-2xl font-bold mb-4">{{ assetName }}</h1>

    <!-- Asset Summary -->
    <div class="asset-summary mb-6">
      <p><strong>Current Value:</strong> {{ formatCurrency(currentValue) }}</p>
      <p><strong>Total Holdings:</strong> {{ totalHoldings }}</p>
      <p><strong>Percentage Changed:</strong> {{ percentageChanged }}%</p>
    </div>

    <!-- Performance Metrics -->
    <div class="performance-metrics mb-6">
      <p><strong>Return on Investment (ROI):</strong> {{ roi }}%</p>
      <p>
        <strong>Net Profit/Loss:</strong> {{ formatCurrency(netProfitLoss) }}
      </p>
      <p>
        <strong>Average Buy Price:</strong>
        {{ formatCurrency(averageBuyPrice) }}
      </p>
      <p>
        <strong>Total Investment:</strong> {{ formatCurrency(totalInvestment) }}
      </p>
    </div>

    <!-- Transaction List -->
    <TransactionList :transactions="transactions" />

    <!-- Delete Button -->
    <div class="delete-button mt-6">
      <Button
        label="Remove Asset"
        class="p-button-danger"
        @click="goToRemoveAsset"
      />
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Card from "primevue/card";
import Button from "primevue/button";
import TransactionList from "@/components/portfolio/TransactionList.vue";
import router from "@/router";

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
const transactions = ref([]);

const getCoinbaseCryptoProductDataByProfileID = async (profileId: string) => {
  // Mocking API response for demonstration purposes
  return [
    {
      product_id: "BTC-USD",
      base_name: "Bitcoin",
      current_value: 50000,
      total_holdings: 2,
      percentage_changed: 5,
      roi: 20,
      net_profit_loss: 20000,
      average_buy_price: 25000,
      total_investment: 50000,
      transactions: [
        {
          timestamp: "2023-01-01T10:00:00Z",
          amount: 10000,
          balance: 20000,
          symbol: "BTC",
          description: "Purchase",
        },
        {
          timestamp: "2023-02-01T12:00:00Z",
          amount: 5000,
          balance: 25000,
          symbol: "BTC",
          description: "Deposit",
        },
      ],
    },
  ];
};

const goToRemoveAsset = () => {
  router.push({
    name: "removeAsset",
    params: { profileId: props.profileId, assetId: props.assetId },
  });
};

onMounted(async () => {
  const allAssets = await getCoinbaseCryptoProductDataByProfileID(
    props.profileId
  );
  const asset = allAssets.find((a) => a.product_id === props.assetId);

  if (asset) {
    assetName.value = asset.base_name;
    currentValue.value = asset.current_value;
    totalHoldings.value = asset.total_holdings;
    percentageChanged.value = asset.percentage_changed;
    roi.value = asset.roi;
    netProfitLoss.value = asset.net_profit_loss;
    averageBuyPrice.value = asset.average_buy_price;
    totalInvestment.value = asset.total_investment;
    transactions.value = asset.transactions;
  }
});

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};
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
