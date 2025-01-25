<template>
  <Card class="center-card">
    <template #title> Remove Asset </template>
    <template #content>
      <!-- Finalize -->
      <div class="step-content">
        <p>Review and finalize the asset to remove from your portfolio:</p>
        <ul>
          <li>{{ asset?.base_name }}</li>
        </ul>
      </div>
    </template>

    <template #footer>
      <div class="card-footer">
        <Button
          label="Back"
          severity="secondary"
          @click="goToViewAsset"
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

const props = defineProps<{ profileId: string; assetId: string }>();
const asset = ref();

const goToViewAsset = () => {
  router.push({
    name: "viewAsset",
    params: { profileId: props.profileId, assetId: props.assetId },
  });
}

const finalizeRemoval = async () => {
  await updateProfile(props.profileId, (profile) => {
    profile.trackerConfig.whiteList = profile.trackerConfig.whiteList.filter(
      (item) => item !== props.assetId
    );
  });
  router.push({ name: "portfolio", params: { profileId: props.profileId } });
};

onMounted(async () => {
  const investedAssets = await getAllCoinbaseCryptoProductDataByProfileId(
    props.profileId
  );
  asset.value = investedAssets.find((a) => a.product_id === props.assetId);
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
