<script setup>
import router from "@/router/router";
import CartProduct from "./CartProduct.vue";
import { useCart } from "@/stores/cart";

const cart = useCart();
const emits = defineEmits(["close-cart"]);
</script>

<template>
  <div
    class="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[512px] h-[512px] bg-white rounded-md px-8 py-6 space-y-5 drop-shadow-lg border-2 border-gray-600 flex flex-col"
  >
    <!-- Placing cart on the screen -->
    <CartProduct v-for="item in cart.cart" :product="item" />
    <button
      @click="$emit('close-cart')"
      class="absolute text-2xl top-0 right-0 mr-2 hover:cursor-pointer text-red-800"
    >
      <!-- Emits 'close-cart' to parent and then it changes boolean to close cart -->
      x
    </button>
    <div class="flex gap-2 mt-auto mb-12 items-center">
      <div class="text-xl font-semibold">
        TOTAL: {{ cart.total > 0 ? cart.total : 0 }}$
      </div>
      <!-- Gets total from cart store -->
      <div
        class="text-md border-2 border-green-800 bg-gradient-to-l from-green-200/70 to-green-300/70 rounded-md font-bold text-green-900 p-1 hover:cursor-pointer hover:from-green-300/70 hover:to-green-500/70 hover:bg-gradient-to-b"
        @click="router.push(`/checkout`)"
      >
        CHECKOUT
      </div>
      <!-- Sends user to checkout page -->
    </div>
  </div>
</template>
