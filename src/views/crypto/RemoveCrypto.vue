<template>
  <Card class="center-card">
    <template #title> Remove Cryptocurrency </template>
    <template #content>
      <Message severity="warn">
        <p>This action will not sell the asset, but instead remove the assistant's
          ability to manage it.</p>
      </Message>
      <!-- Finalize -->
      <div class="step-content">
        <p>
          Review and finalize the cryptocurrencies to remove from your assistant's control.
        </p>
        <ul>
          <li>{{ crypto?.base_name }}</li>
        </ul>
      </div>
    </template>

    <template #footer>
      <div class="card-footer">
        <Button
          label="Back"
          severity="secondary"
          @click="goToViewCrypto"
        />
        <Button
          label="Submit"
          severity="danger"
          @click="finalizeRemoval"
        />
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { ref, defineProps, computed, onMounted } from "vue";
import Button from "primevue/button";
import Card from "primevue/card";
import Message from "primevue/message";
import { updateProfile } from "@/helpers/AppDataHelper";
import { getAllCoinbaseCryptoProductDataByProfileId } from "@/helpers/CoinbaseHelper";
import router from "@/router";

const props = defineProps<{ profileId: string; cryptoId: string }>();
const crypto = ref();

const goToViewCrypto = () => {
  router.push({
    name: "viewCrypto",
    params: { profileId: props.profileId, cryptoId: props.cryptoId },
  });
}

const finalizeRemoval = async () => {
  await updateProfile(props.profileId, (profile) => {
    profile.trackerConfig.whiteList = profile.trackerConfig.whiteList.filter(
      (item) => item !== props.cryptoId
    );
  });
  router.push({ name: "portfolio", params: { profileId: props.profileId } });
};

onMounted(async () => {
  const investedCryptos = await getAllCoinbaseCryptoProductDataByProfileId(
    props.profileId
  );
  crypto.value = investedCryptos.find((a) => a.product_id === props.cryptoId);
});
</script>

<style scoped>
.center-card {
  margin: auto;
  max-width: 800px;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}
</style>
