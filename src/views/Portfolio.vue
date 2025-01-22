<template>
  <Menubar :model="items">
    <template #item="{ item, props, hasSubmenu }">
      <a :href="item.url" :target="item.target" v-bind="props.action">
        <span :class="item.icon" />
        <span class="ml-2">{{ item.label }}</span>
        <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down ml-2" /> </a
    ></template>
  </Menubar>
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
      <div class="mb-5">
        <p class="text-2xl font-bold m-0 mb-2">Investing</p>
        <p class="text-4xl font-bold mb-1 mt-1">{{ totalInvestment }}</p>
        <p class="text-red-500 text-sm mt-0">{{ priceChange }}</p>
      </div>
      <!-- Chart Area -->
      <div
        class="flex justify-content-center align-items-center flex-column border-2 border-dashed border-round h-12rem mb-2"
      >
        <Button
          label="Enable Smart Trading Assistant"
          class="p-button-outlined p-button-primary"
        />
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
              <span>Held by Smart Trading Assistant<i
                  class="ml-1 text-primary pi pi-info-circle"
                  v-tooltip="
                    'Funds for the trading assistance to invest for you.'
                  "
                  style="cursor: pointer"
                ></i> :</span>
              <span class="font-bold">-{{ moneyHeldByAssistant }}</span>
            </div>
            <div class="flex justify-content-between border-top-1 pt-2 mt-2">
              <span>Total:</span>
              <span class="font-bold">{{ buyingPower }}</span>
            </div>
            <Button
              label="Deposit Funds"
              class="mt-3 p-button-outlined p-button-success"
              icon="pi pi-plus"
              @click=""
            />
          </div> </AccordionTab
      ></Accordion>
    </div>
    <div class="flex w-4 p-5">
      <ul class="p-0 w-7">
        <li class="flex p-1 slim-border">
          <p class="m-1">Cryptocurrencies</p>
        </li>
        <li
          v-for="(currency, index) in cryptocurrencies"
          :key="index"
          class="flex justify-content-between text-sm slim-border p-1"
        >
          <div>
            <p class="m-1">{{ currency.name }}</p>
            <p class="m-1">{{ currency.amount }}</p>
          </div>
          <div>
            <p class="m-1">{{ currency.price }}</p>
            <p
              class="m-1"
              :class="currency.change > 0 ? 'text-green-500' : 'text-red-500'"
            >
              {{ currency.change }}%
            </p>
          </div>
        </li>
        <li class="flex justify-content-center align-items-center slim-border">
          <Button class="m-3">Get Started</Button>
        </li>
      </ul>
    </div>
    <OnboardingModal
      v-if="displayOnboardingModal"
      :visible="displayOnboardingModal"
      :currentPrice="1000"
      @close="handleModalClose"
      @setupCompleted="handleModalClose"
    />
  </div>
</template>
<script lang="ts" setup>
import { Profile } from "main/models";
import Button from "primevue/button";
import { onMounted, ref } from "vue";
import Menubar from "primevue/menubar";
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import OnboardingModal from "@/components/dashboard/OnboardingModal.vue";
import Message from "primevue/message";
import {
  getCoinbaseBalanceByProfileId,
  getCoinbaseCryptoInvestmentInUSDByProfileId,
  getProfile,
} from "@/helpers/AppDataHelper";
import { formatNumber } from "@/filters/FormatNumber";

const displayOnboardingModal = ref<boolean>(false);
const showSetupMessage = ref<boolean>(true);
const profile = ref<Profile>();

//AboveChart
const totalInvestment = ref("0");
const priceChange = ref("");

//BelowChart
const buyingPower = ref("0");
const coinbaseBalance = ref("0");
const moneyHeldByAssistant = ref("0");

defineProps<{ profileId: string }>();

const handleModalClose = () => {
  displayOnboardingModal.value = false;

  setupDashboard();
};

//todo move to separate component
const items = ref([
  {
    label: "Profiles",
    icon: "pi pi-user",
    items: [
      {
        label: "Vue.js",
        url: "https://vuejs.org/",
      },
      {
        label: "Vite.js",
        url: "https://vitejs.dev/",
      },
    ],
  },
]);

const cryptocurrencies = ref([]);

onMounted(async () => {
  await setupDashboard();
});

const setupDashboard = async () => {
  profile.value = await getProfile("1");

  setupCryptoDisplay();
  organizeTotalInvestment();
  organizePriceChange();
  organizeBuyingPower();
};

// Dashboard setup methods
const setupCryptoDisplay = (): void => {
  profile.value.trackerConfig.whiteList.forEach((crypto) => {
    cryptocurrencies.value.push({
      name: crypto,
      amount: "0.004",
      price: "$104,000",
      change: 0.04,
    });
  });
};
const organizeTotalInvestment = (): void => {
  //todo incorporate ledger and tracker
  totalInvestment.value = formatNumber(
    profile.value.trackerConfig.initialDeposit,
    { currency: true }
  );
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
  const rawCoinbaseBalance = await getCoinbaseBalanceByProfileId("1");
  const InitialDeposit = profile.value.trackerConfig.initialDeposit;
  let difference = rawCoinbaseBalance - InitialDeposit;

  if (difference < 0) {
    difference = 0;
  }

  //pull total from coinbase and subtract it from amount sitting in the fund.
  coinbaseBalance.value = formatNumber(rawCoinbaseBalance.toString(), {
    currency: true,
  });
  moneyHeldByAssistant.value = formatNumber(InitialDeposit.toString(), {
    currency: true,
  });
  buyingPower.value = formatNumber(difference, { currency: true });
};
</script>

<style lang="scss" scoped>
.slim-border {
  border: 0.5px solid rgba(255, 255, 255, 0.5); /* Custom half-pixel transparent border */
}
</style>
