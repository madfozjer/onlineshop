<script setup>
import CartProduct from "./CartProduct.vue";
import { useCart } from "@/stores/cart";
import { defineEmits } from "vue";

const cart = useCart();
const emit = defineEmits();
</script>

<template>
  <div
    class="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[512px] h-[512px] bg-white rounded-md px-8 py-6 space-y-5 drop-shadow-lg border-2 border-gray-600"
  >
    <CartProduct
      v-for="item in cart.cart"
      :name="item.name"
      :parameters="item.paramaters"
      :price="item.price"
      :image="item.image"
    />
    <button
      @click="emit('close-cart')"
      class="absolute top-0 right-0 mr-2 hover:cursor-pointer text-red-800"
    >
      x
    </button>
  </div>
</template>
