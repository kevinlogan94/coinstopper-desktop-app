<template>
  <div class="transaction-list">
    <DataTable
      v-model:filters="filters"
      :value="formattedTransactions"
      :paginator="true"
      :rows="5"
      class="w-full"
      :globalFilterFields="['timestamp', 'symbol', 'description', 'amount']"
    >
      <template #header>
        <div
          class="flex flex-wrap align-items-center justify-content-between gap-2"
        >
          <span class="text-xl text-900 font-bold">Transactions</span>
          <IconField iconPosition="left">
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText
              v-model="filters['global'].value"
              placeholder="Keyword Search"
            />
          </IconField>
        </div>
      </template>
      <Column field="timestamp" header="Timestamp" sortable />
      <Column field="symbol" header="Symbol" sortable />
      <Column field="description" header="Description" sortable
        ><template #body="slotProps">
          <Tag
            :value="getFirstWord(slotProps.data.description)"
            :severity="getDescriptionSeverity(slotProps.data.description)"
          />
        </template>
      </Column>
      <Column field="amount" header="Amount" sortable />
      <Column field="balance" header="Balance" sortable />
      <template #footer>
        In total there are
        {{ transactions ? transactions.length : 0 }} Transactions.
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { formatNumber } from "@/filters/FormatNumber";
import { formatDate } from "@/filters/FormatDate";
import { Transaction } from "main/models";
import Tag from "primevue/tag";
import { FilterMatchMode } from "primevue/api";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";

const props = defineProps({
  transactions: {
    type: Array as PropType<Array<Transaction>>,
    required: true,
  },
});

const formattedTransactions = computed(() =>
  props.transactions.map((t) => ({
    ...t,
    timestamp: formatDate(t.timestamp), // Format timestamp without mutating original data
    balance: formatNumber(t.balance, { currency: true }),
    amount: formatNumber(t.amount, { currency: true }),
  }))
);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const getDescriptionSeverity = (description: string) => {
  if (description.includes("Purchase") || description.includes("Deposit")) {
    return "success";
  } else if (description.includes("Sell") || description.includes("Withdraw")) {
    return "danger";
  } else {
    return "warning";
  }
};

const getFirstWord = (str: string): string => {
  return str.trim().split(/\s+/)[0] || "";
};
</script>

<style scoped>
.transaction-list {
  margin-top: 1rem;
}

/* Table styling */
.p-datatable {
  width: 100%;
  border-collapse: collapse;
}
.p-datatable th,
.p-datatable td {
  padding: 0.75rem;
  text-align: left;
  border: 1px solid #dee2e6;
}
.p-datatable th {
  background-color: #f8f9fa;
}
</style>
