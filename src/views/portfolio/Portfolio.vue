<template>
  <Message v-if="showSetupMessage">
    <div class="flex align-items-center">
      <span
        >Start investing by choosing your first cryptocurrency and adding an
        investment.</span
      >
      <Button
        label="Start Setup"
        class="p-button-text p-0 pl-3"
        @click="displayOnboardingModal = true"
      />
    </div>
  </Message>
  <div class="flex justify-content-between">
    <div class="flex-grow p-5 w-8">
      <div class="mb-5 flex justify-content-between">
        <div>
          <p class="text-2xl font-bold m-0 mb-2">Investing</p>
          <p class="text-4xl font-bold mb-1 mt-1" v-if="!isLoading">
            {{ currentPortfolioValue }}
          </p>
          <!-- <p class="text-red-500 text-sm mt-0">{{ priceChange }}</p> -->
        </div>
        <div>
          <Button
            :label="
              profile?.appConfig?.trackerEnabled
                ? 'Trading Assistant: Running'
                : 'Trading Assistant: Paused'
            "
            :icon="
              profile?.appConfig?.trackerEnabled ? 'pi pi-pause' : 'pi pi-play'
            "
            :severity="
              profile?.appConfig?.trackerEnabled ? 'success' : 'warning'
            "
            @click="toggleTradingAssistant"
          ></Button>
        </div>
      </div>
      <!-- KPIs -->
      <div class="flex flex-wrap gap-3 justify-content-between mb-3">
        <Card
          v-for="kpi in kpis"
          :key="kpi.label"
          class="kpi-card flex-1 bg-gray-850"
        >
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
      <!-- Buying Power -->
      <Accordion
        ><AccordionTab>
          <template #header>
            <div class="flex justify-content-between align-items-center w-full">
              <div class="flex align-items-center">
                <span>Buying Power</span>
                <i
                  class="ml-2 text-primary pi pi-info-circle cursor-pointer"
                  v-tooltip="
                    'Buying Power represents the amount you can allocate to the trading assistant.'
                  "
                ></i>
              </div>
              <span class="text-right font-bold text-green-500">{{
                buyingPower
              }}</span>
            </div>
          </template>
          <div class="flex flex-column gap-2">
            <div class="flex justify-content-between">
              <span>Available in Coinbase:</span>
              <span class="font-bold">{{ coinbaseBalance }}</span>
            </div>
            <div class="flex justify-content-between">
              <span
                >Held by Smart Trading Assistant<i
                  class="ml-1 text-primary pi pi-info-circle cursor-pointer"
                  v-tooltip="
                    'Funds for the trading assistance to invest for you.'
                  "
                ></i>
                :</span
              >
              <span class="font-bold">-{{ moneyHeldByAssistant }}</span>
            </div>
            <div class="flex justify-content-between border-top-1 pt-2 mt-2">
              <span>Total:</span>
              <span class="font-bold">{{ buyingPower }}</span>
            </div>
            <Button
              label="Allocate to Assistant"
              severity="success"
              class="mt-3 p-button-outlined"
              icon="pi pi-plus"
              :disabled="buyingPower.includes('0.00')"
              @click="goToAllocateToAssistant"
            />
            <Button
              label="Withdraw from Assistant"
              class="mt-3 p-button-outlined"
              severity="danger"
              icon="pi pi-minus"
              :disabled="moneyHeldByAssistant.includes('0.00')"
              @click="goToWithdrawFromAssistant"
            ></Button>
          </div> </AccordionTab
      ></Accordion>
      <TransactionList v-if="transactions" :transactions="transactions" />
    </div>
    <!-- Right Side Bar -->
    <div class="flex w-4 p-5 crypto-list">
      <ul class="p-0 w-7 m-0">
        <li class="flex p-1 slim-border bg-gray-850 align-items-center justify-content-between">
          <p class="m-0 ml-1">Cryptocurrencies</p>
          <Button
            icon="pi pi-plus"
            severity="info"
            text
            @click="goToAddCrypto"
          ></Button>
        </li>
        <li
          v-for="(currency, index) in cryptocurrencies"
          :key="index"
          @click="goToViewCrypto(currency.product_id)"
          class="flex justify-content-between text-sm slim-border bg-gray-850 cursor-pointer"
        >
          <div>
            <p class="m-1">{{ currency.currency }}</p>
            <p class="m-1">{{ currency.balanceInCrypto }}</p>
          </div>
          <div class="flex flex-column align-items-end">
            <p class="m-1">
              {{ formatNumber(currency.priceInUSD, { currency: true }) }}
            </p>
            <p
              class="m-1"
              :class="
                currency.priceChangePercentage24h > 0
                  ? 'text-green-500'
                  : 'text-red-500'
              "
            >
              {{ currency.priceChangePercentage24h }}%
            </p>
          </div>
        </li>
      </ul>
    </div>
    <OnboardingModal
      v-if="displayOnboardingModal"
      :visible="displayOnboardingModal"
      :currentPrice="1000"
      :profile-id="profileId"
      @close="handleModalClose"
      @setupCompleted="handleModalClose"
    />
  </div>
</template>
<script lang="ts" setup>
import { Profile, Transaction } from "main/models";
import Button from "primevue/button";
import { onMounted, ref } from "vue";
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import OnboardingModal from "@/components/portfolio/OnboardingModal.vue";
import Message from "primevue/message";
import { getAllCoinbaseCryptoProductDataByProfileId } from "@/helpers/CoinbaseHelper";
import {
  getLedgerByProfileId,
  getProfile,
  updateProfile,
} from "@/helpers/AppDataHelper";
import { formatNumber } from "@/filters/FormatNumber";
import router from "@/router";
import { getBuyingMetrics } from "@/helpers/Helpers";
import TransactionList from "@/components/portfolio/TransactionList.vue";
import Card from "primevue/card";
import { LabelValuePair } from "@/models";

const displayOnboardingModal = ref<boolean>(false);
const showSetupMessage = ref<boolean>(true);
const profile = ref<Profile>();
const isLoading = ref<boolean>();

//AboveBuyingPower
const currentPortfolioValue = ref("0");
const priceChange = ref("");

//BuyingPowerAndLower
const buyingPower = ref("0");
const coinbaseBalance = ref("0");
const moneyHeldByAssistant = ref("0");
const kpis = ref<Array<LabelValuePair>>([]);
const transactions = ref<Array<Transaction>>();

//Right sidebar
const cryptocurrencies = ref([]);

const props = defineProps<{ profileId: string }>();

const handleModalClose = () => {
  displayOnboardingModal.value = false;

  setupPortfolio();
};

onMounted(async () => {
  await setupPortfolio();
});

const setupPortfolio = async () => {
  isLoading.value = true;

  profile.value = await getProfile(props.profileId);

  organizeLedgerData();
  organizePriceChange();
  organizeBuyingPower();
  setupCryptoDisplay();
  organizeKpis();
  isLoading.value = false;
};

// Portfolio setup methods
const setupCryptoDisplay = async (): Promise<void> => {
  const whiteList = profile.value?.trackerConfig?.whiteList;

  if (whiteList?.length) {
    // Fetch all crypto product data
    const result = await getAllCoinbaseCryptoProductDataByProfileId(
      props.profileId
    );

    // Filter to only include whitelisted products
    cryptocurrencies.value = result.filter((product) =>
      whiteList.includes(product.product_id)
    );
  }
};
const organizePriceChange = () => {
  const verbiage = "ICON PRICE (PERCENTAGE) Today";
  priceChange.value = verbiage
    .replace("ICON", "▼")
    .replace("PRICE", formatNumber("20", { currency: true }))
    .replace("PERCENTAGE", formatNumber("0.02", { percentage: true }));
};
const organizeBuyingPower = async () => {
  var result = await getBuyingMetrics(props.profileId);

  coinbaseBalance.value = result.coinbaseBalance;
  moneyHeldByAssistant.value = result.moneyHeldByAssistant;
  buyingPower.value = result.buyingPower;
};
const organizeLedgerData = async () => {
  transactions.value = await getLedgerByProfileId(props.profileId);
};
const organizeKpis = async () => {
  const rawMetrics = await window.electronAPI.getTrackerMetricsByProfileId(
    props.profileId
  );
  currentPortfolioValue.value = formatNumber(rawMetrics.currentPortfolioValue, {
    currency: true,
  });

  kpis.value = [
    {
      label: "Total Profit/Loss",
      value:
        rawMetrics.totalPL != 0
          ? formatNumber(rawMetrics.totalPL, { currency: true })
          : "N/A",
    },
    {
      label: "ROI",
      value:
        rawMetrics.roiPercentage != 0
          ? formatNumber(rawMetrics.roiPercentage, { percentage: true })
          : "N/A",
    },
    {
      label: "Held By Assistant",
      value: formatNumber(rawMetrics.availableFunds, { currency: true }),
    },
    { label: "Winning Trades", value: rawMetrics.winningTrades },
  ];
};

const toggleTradingAssistant = async () => {
  await updateProfile(props.profileId, (profile) => {
    profile.appConfig.trackerEnabled = !profile.appConfig.trackerEnabled;
    if (profile.appConfig.trackerEnabled) {
      window.electronAPI.startTradingAssistant(props.profileId);
    } else {
      window.electronAPI.stopTradingAssistant(props.profileId);
    }
  });
  profile.value = await getProfile(props.profileId);
};

// Router methods
const goToAddCrypto = () => {
  router.push({ name: "addCrypto", params: { profileId: props.profileId } });
};
const goToViewCrypto = (cryptoId: string) => {
  router.push({
    name: "viewCrypto",
    params: { profileId: props.profileId, cryptoId: cryptoId },
  });
};
const goToAllocateToAssistant = () => {
  router.push({
    name: "manageAssistantAllocations",
    params: { profileId: props.profileId, action: "allocate" },
  });
};
const goToWithdrawFromAssistant = () => {
  router.push({
    name: "manageAssistantAllocations",
    params: { profileId: props.profileId, action: "withdraw" },
  });
};
</script>

<style lang="scss" scoped>
.slim-border {
  border: 1px solid #383838; /* Custom half-pixel transparent border */
  border-bottom: none;
}
li:last-child {
  border: 1px solid #383838; /* Custom half-pixel transparent border */
}
</style>
