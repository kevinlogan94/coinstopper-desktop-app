<template>
  <div class="transaction-list">
    <DataTable 
      :value="transactions" 
      :paginator="true" 
      :rows="10" 
      :sortMode="'multiple'" 
      class="w-full">
      <Column field="timestamp" header="Timestamp" sortable :body="formatDateBody" />
      <Column field="symbol" header="Symbol" sortable />
      <Column field="description" header="Description" sortable :body="formatDescriptionBody" />
      <Column field="amount" header="Amount" sortable :body="formatCurrencyBody" />
      <Column field="balance" header="Balance" sortable :body="formatCurrencyBody" />
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { formatNumber } from "@/filters/FormatNumber";
import { formatDate } from "@/filters/FormatDate";
import { Transaction } from "main/models";

const props = defineProps({
  transactions: {
    type: Array as PropType<Array<Transaction>>,
    required: true,
  },
});

const formatDateBody = (transaction: Transaction): string => {
  return formatDate(transaction.timestamp);
};

const formatCurrencyBody = (transaction: Transaction, field: string): string => {
  return formatNumber(transaction[field as keyof Transaction]);
};

const formatDescriptionBody = (transaction: Transaction): string => {
  const rowClass = getRowClass(transaction.description);
  return `<span class="${rowClass}">${transaction.description}</span>`;
};

const getRowClass = (description: string): string => {
  if (description.includes("Purchase") || description.includes("Deposit")) {
    return "bg-green-100";
  } else if (description.includes("Sell") || description.includes("Withdraw")) {
    return "bg-red-100";
  } else {
    return "bg-yellow-100";
  }
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
