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
            {{ totalInvestment }}
          </p>
          <p class="text-red-500 text-sm mt-0">{{ priceChange }}</p>
        </div>
        <div>
          <Button
            label="Trading Assistant"
            :icon="
              profile?.appConfig?.trackerEnabled ? 'pi pi-play' : 'pi pi-pause'
            "
            :severity="
              profile?.appConfig?.trackerEnabled ? 'success' : 'warning'
            "
            @click="toggleTradingAssistant"
          ></Button>
        </div>
      </div>
      <!-- Chart Area -->
      <div
        class="flex justify-content-center align-items-center flex-column border-2 border-dashed border-round h-12rem mb-2"
      >
        <!-- <Button
          label="Enable Smart Trading Assistant"
          class="p-button-outlined p-button-primary"
        /> -->
      </div>
      <!-- Buying Power -->
      <Accordion :activeIndex="0"
        ><AccordionTab>
          <template #header>
            <div class="flex justify-content-between align-items-center w-full">
              <div class="flex align-items-center">
                <span>Buying Power</span>
                <i
                  class="ml-2 text-primary pi pi-info-circle"
                  v-tooltip="
                    'Buying Power represents the amount you can invest in the trading assistant.'
                  "
                  style="cursor: pointer"
                ></i>
              </div>
              <span class="text-right font-bold text-primary">{{
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
                  class="ml-1 text-primary pi pi-info-circle"
                  v-tooltip="
                    'Funds for the trading assistance to invest for you.'
                  "
                  style="cursor: pointer"
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
              label="Deposit Funds"
              severity="success"
              class="mt-3 p-button-outlined"
              icon="pi pi-plus"
              :disabled="buyingPower.includes('0.00')"
              @click="goToAddFund"
            />
            <Button
              label="Remove Funds"
              class="mt-3 p-button-outlined"
              severity="danger"
              icon="pi pi-minus"
              :disabled="moneyHeldByAssistant.includes('0.00')"
              @click="goToRemoveFund"
            ></Button>
          </div> </AccordionTab
      ></Accordion>
    </div>
    <div class="flex w-4 p-5">
      <ul class="p-0 w-7 m-0">
        <li class="flex p-1 slim-border">
          <p class="m-1">Cryptocurrencies</p>
        </li>
        <li
          v-for="(currency, index) in cryptocurrencies"
          :key="index"
          @click="goToViewAsset(currency.product_id)"
          class="flex justify-content-between text-sm slim-border p-1"
        >
          <div>
            <p class="m-1">{{ currency.currency }}</p>
            <p class="m-1">{{ currency.balanceInCrypto }}</p>
          </div>
          <div>
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
        <li class="flex justify-content-center align-items-center slim-border">
          <Button @click="goToAddAsset" class="m-3">Add</Button>
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
import { Profile } from "main/models";
import Button from "primevue/button";
import { onMounted, ref } from "vue";
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import OnboardingModal from "@/components/portfolio/OnboardingModal.vue";
import Message from "primevue/message";
import {
  getAllCoinbaseCryptoProductDataByProfileId,
  getCoinbaseCryptoInvestmentInUSDByProfileId,
} from "@/helpers/CoinbaseHelper";
import { getProfile, updateProfile } from "@/helpers/AppDataHelper";
import { formatNumber } from "@/filters/FormatNumber";
import router from "@/router";
import { getBuyingMetrics } from "@/helpers/Helpers";

const displayOnboardingModal = ref<boolean>(false);
const showSetupMessage = ref<boolean>(true);
const profile = ref<Profile>();
const isLoading = ref<boolean>();

//AboveChart
const totalInvestment = ref("0");
const priceChange = ref("");

//BelowChart
const buyingPower = ref("0");
const coinbaseBalance = ref("0");
const moneyHeldByAssistant = ref("0");

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

  await setupCryptoDisplay();
  await organizeTotalInvestment();
  organizePriceChange();
  organizeBuyingPower();
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
const organizeTotalInvestment = async (): Promise<void> => {
  const cryptoInvestmentInUSD =
    await getCoinbaseCryptoInvestmentInUSDByProfileId(props.profileId);
  totalInvestment.value = formatNumber(cryptoInvestmentInUSD, {
    currency: true,
  });
};
const organizePriceChange = () => {
  const verbiage = "ICON PRICE (PERCENTAGE) Today";
  priceChange.value = verbiage
    .replace("ICON", "▼")
    .replace("PRICE", formatNumber("20", { currency: true }))
    .replace("PERCENTAGE", formatNumber("0.02", { percentage: true }));
};
const organizeChart = () => {
  //organize chart for display
};
const organizeBuyingPower = async () => {
  var result = await getBuyingMetrics(props.profileId);

  coinbaseBalance.value = result.coinbaseBalance;
  moneyHeldByAssistant.value = result.moneyHeldByAssistant;
  buyingPower.value = result.buyingPower;
};

const toggleTradingAssistant = async () => {
  await updateProfile(props.profileId, profile => {
    profile.appConfig.trackerEnabled = !profile.appConfig.trackerEnabled;
  });
  profile.value = await getProfile(props.profileId);
}

// Router methods
const goToAddAsset = () => {
  router.push({ name: "addAsset", params: { profileId: props.profileId } });
};
const goToViewAsset = (assetId: string) => {
  router.push({
    name: "viewAsset",
    params: { profileId: props.profileId, assetId: assetId },
  });
};
const goToAddFund = () => {
  router.push({
    name: "manageFund",
    params: { profileId: props.profileId, action: "add" },
  });
};
const goToRemoveFund = () => {
  router.push({
    name: "manageFund",
    params: { profileId: props.profileId, action: "remove" },
  });
};
</script>

<style lang="scss" scoped>
.slim-border {
  border: 0.5px solid rgba(255, 255, 255, 0.5); /* Custom half-pixel transparent border */
}
</style>
