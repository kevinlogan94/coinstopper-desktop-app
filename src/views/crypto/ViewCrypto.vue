<template>
  <Card class="view-crypto">
    <!-- Crypto Name -->
    <template #title>
        <h1 class="text-2xl font-bold mb-4">{{ cryptoName }}</h1>
    </template>

    <template #content>
        <!-- Crypto Summary -->
        <div class="crypto-summary mb-6">
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
import TransactionList from "@/components/portfolio/TransactionList.vue";
import router from "@/router";
import { getAllCoinbaseCryptoProductDataByProfileId } from "@/helpers/CoinbaseHelper";
import { getLedgerByProfileId } from "@/helpers/AppDataHelper";
import { Transaction } from "main/models";
import { formatNumber } from "@/filters/FormatNumber";

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
const transactions = ref<Array<Transaction>>([]);

const goToRemoveCrypto = () => {
  router.push({
    name: "removeCrypto",
    params: { profileId: props.profileId, cryptoId: props.cryptoId },
  });
};

onMounted(async () => {
  const allAvailableCrypto = await getAllCoinbaseCryptoProductDataByProfileId(
    props.profileId
  );
  const crypto = allAvailableCrypto.find((a) => a.product_id === props.cryptoId);

  if (crypto) {
    cryptoName.value = crypto.base_name;
    currentValue.value = crypto.priceInUSD;
    totalHoldings.value = crypto.balanceInCrypto;
    percentageChanged.value = crypto.priceChangePercentage24h;
    // roi.value = crypto.roi;
    // netProfitLoss.value = crypto.net_profit_loss;
    // averageBuyPrice.value = crypto.average_buy_price;
  } else {
    console.error("Missing Crypto");
  }
  
  await organizeTrasactions();
});

const organizeTrasactions = async () => {
    var ledger = await getLedgerByProfileId(props.profileId);
    var cryptoLedger = ledger.filter(t => t.symbol === props.cryptoId);
    transactions.value = cryptoLedger;
}

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
