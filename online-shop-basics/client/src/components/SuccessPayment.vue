<script setup>
const orderId = window.location.pathname.split("/").filter(Boolean).pop();
</script>
<template>
  <div class="flex flex-col text-center justify-center -mt-16 h-screen">
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
</template>
