<script setup>
import CartProduct from "@/components/CartProduct.vue";
import Navigation from "@/components/Navigation.vue";
import { useCart } from "@/stores/cart";
const cart = useCart();
</script>

<template>
  <Navigation></Navigation>
  <div class="justify-center flex h-screen">
    <div class="flex flex-col gap-4 mt-12">
      <CartProduct
        v-for="item in cart.cart"
        :product="item"
        class="border rounded-md w-lg"
      />
      <span class="text-2xl font-semibold mt-52"
        >TOTAL: <span class="font-normal">{{ cart.total }}$</span></span
      >
    </div>
  </div>
</template>
