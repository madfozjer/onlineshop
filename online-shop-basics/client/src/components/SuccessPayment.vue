<script setup>
import { useProductsList } from "@/stores/products";
import { ref } from "vue";

const products = useProductsList();
const isExist = ref(false);

// Get orderId from URL
const orderId = window.location.pathname.split("/").filter(Boolean).pop();

products
  .getAPI(`checkorder/${orderId}`)
  .then((response) => {
    if (response.status == "SHIPPING") {
      isExist.value = true;
    } else {
      isExist.value = false;
    }
  })
  .catch((error) => {
    console.error("Error checking order status:", error);
    isExist.value = false;
  });
</script>
<template>
  <div
    class="flex flex-col text-center justify-center -mt-16 h-screen"
    v-if="isExist"
  >
    <span class="text-4xl">Payment Successful!</span>
    <span class="text-2xl font-thin">Order ID: {{ orderId }}</span>
    <span class="text-2xl font-thin">Thank you for your purchase!</span>
    <span class="text-xl">You will receive an email confirmation shortly.</span>
    <div class="flex justify-center mt-8">
      <router-link
        to="/"
        class="bg-gradient-to-l from-blue-200/70 to-blue-300/70 border-blue-800 border-1 font-bold text-blue-900 px-4 py-2 rounded"
      >
        Go to Home
      </router-link>
    </div>
  </div>
  <div
    v-if="!isExist"
    class="flex flex-col text-center justify-center -mt-16 h-screen"
  >
    Sorry, your order doesn't exist.
  </div>
</template>
