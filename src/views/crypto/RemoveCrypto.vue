<template>
  <Card class="center-card">
    <template #title> Remove Crypto </template>
    <template #content>
      <!-- Finalize -->
      <div class="step-content">
        <p>Review and finalize the crypto to remove from your portfolio:</p>
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
  max-width: 500px;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}
</style>
