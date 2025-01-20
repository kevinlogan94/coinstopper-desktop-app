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
        <h1 class="text-2xl font-bold">Investing</h1>
        <p class="text-4xl font-bold mb-1">$7,920.90</p>
        <p class="text-red-500 text-sm">▼ $158.65 (0.20%) Today</p>
      </div>
      <Accordion :activeIndex="0"
        ><AccordionTab header="Buying Power"
          ><p>test</p></AccordionTab
        ></Accordion
      >
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
        <li
          v-if="!cryptocurrencies.length"
          class="flex justify-content-center align-items-center slim-border"
        >
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
import { isEmptyObject } from "@/helpers/Helpers";
import { readAppData } from "@/helpers/ElectronHelper";
import { Profile } from "main/models";
import Button from "primevue/button";
import { onMounted, ref } from "vue";
import Menubar from "primevue/menubar";
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import OnboardingModal from "@/components/dashboard/OnboardingModal.vue";
import Message from "primevue/message";
import { getProfile } from "@/helpers/appDataHelper";

const displayOnboardingModal = ref<boolean>(false);
const showSetupMessage = ref<boolean>(true);
const profile = ref<Profile>();

const handleModalClose = () => {
  displayOnboardingModal.value = false;
};

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

const cryptocurrencies = ref([
  { name: "Bitcoin", amount: "0.004", price: "$104,000", change: 0.04 },
  { name: "Ethereum", amount: "1.2", price: "$3,200", change: -0.2 },
  { name: "Cardano", amount: "320", price: "$1.50", change: 1.1 },
]);

onMounted(async () => {
  profile.value = await getProfile("1");
  console.log(profile.value);
});
</script>

<style lang="scss" scoped>
.slim-border {
  border: 0.5px solid rgba(255, 255, 255, 0.5); /* Custom half-pixel transparent border */
}
</style>
