<template>
 <Avatar icon="pi pi-user" size="xlarge" :style="{'background-color': backgroundColor, 'color': '#2a1261'}" shape="circle" />
 <p>{{name}}</p>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue';

defineProps({
  name: {
    type: String,
    required: true,
  },
  backgroundColor: {
    type: String,
    default: "#ece9fc", // Default background color
  },
  id: {
    type: [String, Number],
    required: true,
  },
});

onMounted(() => {
    
});

</script>