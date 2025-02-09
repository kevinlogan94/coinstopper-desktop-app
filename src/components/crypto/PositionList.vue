<template>
  <div class="position-list">
    <!-- Add Loading Indicator -->
    <div
      v-if="!positions?.length"
      class="flex flex-column justify-content-center align-items-center border-1 border-round border-gray-300 p-5 w-full"
    >
      <h3 class="text-xl font-semibold">Come Back Soon!</h3>
      <p class="mt-0">It looks like your assistant has yet to make a buy.</p>
    </div>
    <DataTable
      v-else
      v-model:filters="filters"
      :value="formattedPositions"
      :paginator="true"
      :rows="5"
      class="w-full"
      :globalFilterFields="['timeStamp', 'buyPrice', 'invested', 'plAmount', 'plPercentage', 'wasSold']"
    >
      <template #header>
        <div
          class="flex flex-wrap align-items-center justify-content-between gap-2"
        >
          <span class="text-xl text-900 font-bold"
            >Positions for {{ coinSymbol }}</span
          >
          <IconField iconPosition="left">
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText
              v-model="filters['global'].value"
              placeholder="Search Positions"
            />
          </IconField>
        </div>
      </template>
      <Column field="timeStamp" header="Timestamp" sortable />
      <Column field="buyPrice" header="Buy Price" sortable />
      <Column field="invested" header="Invested Amount" sortable />
      <Column field="plAmount" header="Profit/Loss" sortable>
        <template #body="slotProps">
          <span
            :class=getPLClass(slotProps.data.plAmount)
          >
            {{ slotProps.data.plAmount}}
          </span>
        </template>
      </Column>

      <Column field="plPercentage" header="ROI %" sortable>
        <template #body="slotProps">
          <Tag
            :value="
              slotProps.data.plPercentage
            "
            :severity="getPLSeverity(slotProps.data.plPercentage)"
          />
        </template>
      </Column>

      <Column field="wasSold" header="Status" sortable>
        <template #body="slotProps">
          <Tag
            :value="slotProps.data.wasSold ? 'Sold' : 'Holding'"
            :severity="slotProps.data.wasSold ? 'danger' : 'success'"
          />
        </template>
      </Column>

      <template #footer> Total Positions: {{ positions?.length }} </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps, ref } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import { FilterMatchMode } from "primevue/api";
import { PositionMetrics } from "main/services/trackerFileManager";
import { formatNumber } from "@/filters/FormatNumber";
import { formatDate } from "@/filters/FormatDate";
import { convertCurrencyToNumber } from "@/helpers/Helpers";

const props = defineProps({
  coinSymbol: String,
  positions: {
    type: Array<PositionMetrics>,
    default: [],
  },
});

const formattedPositions = computed(() => props.positions.map((p) => ({
    ...p,
    timeStamp: formatDate(p.timeStamp), // Format timestamp without mutating original data
    buyPrice: formatNumber(p.buyPrice, { currency: true }),
    plAmount: formatNumber(p.plAmount, { currency: true }),
    plPercentage: formatNumber(p.plPercentage, {percentage: true}),
    invested: formatNumber(p.invested, { currency: true }),
  })));

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const getPLClass = (plAmount: string) => {
  const currencyNumber = convertCurrencyToNumber(plAmount);
  return currencyNumber > 0 ? "text-green-500" : "text-red-500"
}
const getPLSeverity = (plPercentage: string) => {
  const percentage = parseFloat(plPercentage);
  if (percentage > 0) return "success";
  if (percentage < 0) return "danger";
  return "warning";
};
</script>

<style scoped>
.position-list {
  margin-top: 1rem;
  min-width: 800px;
}
</style>
