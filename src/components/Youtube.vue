<script setup>
import { ref } from "vue";
import YouTube from "vue3-youtube";

defineProps(["id"]);

const youtube = ref(null);
const currentTime = ref(0);
setInterval(() => {
  currentTime.value = youtube?.value?.getCurrentTime();
}, 4);
</script>

<template>
  <q-card class="q-pa-md" style="max-width: none">
    <q-card-section>
      <YouTube :src="id" width="1280" height="720" ref="youtube" />
      <div class="text-h6">
        현재 유튜브 시간: {{ currentTime.toFixed(3) }} 초 <br />일시정지
        상태에서 ,(&lt;) 또는 .(>) 키로 1프레임씩 이동
      </div>
    </q-card-section>
  </q-card>
</template>

<style scoped></style>
