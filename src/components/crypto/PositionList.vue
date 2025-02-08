<template>
  <div class="position-list">
    <DataTable
      v-model:filters="filters"
      :value="formattedPositions"
      :paginator="true"
      :rows="5"
      class="w-full"
      :globalFilterFields="['buyPrice', 'invested', 'plAmount', 'plPercentage']"
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

      <Column field="buyPrice" header="Buy Price" sortable>
        <template #body="slotProps">
          {{ formatNumber(slotProps.data.buyPrice, { currency: true }) }}
        </template>
      </Column>

      <Column field="invested" header="Invested Amount" sortable>
        <template #body="slotProps">
          {{ formatNumber(slotProps.data.invested, { currency: true }) }}
        </template>
      </Column>

      <Column field="plAmount" header="Profit/Loss" sortable>
        <template #body="slotProps">
          <span
            :class="{
              'text-green-500': slotProps.data.plAmount > 0,
              'text-red-500': slotProps.data.plAmount < 0,
            }"
          >
            {{ formatNumber(slotProps.data.plAmount, { currency: true }) }}
          </span>
        </template>
      </Column>

      <Column field="plPercentage" header="ROI %" sortable>
        <template #body="slotProps">
          <Tag
            :value="
              formatNumber(slotProps.data.plPercentage, { percentage: true })
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

      <template #footer> Total Positions: {{ positions.length }} </template>
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

const props = defineProps<{
  coinSymbol: string;
  positions: PositionMetrics[];
}>();

const formattedPositions = computed(() => props.positions);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const getPLSeverity = (plPercentage: number) => {
  if (plPercentage > 0) return "success";
  if (plPercentage < 0) return "danger";
  return "warning";
};
</script>

<style scoped>
.position-list {
  margin-top: 1rem;
}
</style>
