<script setup>
import { ref } from "vue";
import { useCart } from "@/stores/cart";

const cart = useCart();

const props = defineProps({
  product: Object,
});

const canDelete = ref(false);
</script>

<template>
  <div
    class="flex gap-2 hover:bg-gray-100"
    @mouseover="canDelete = true"
    @mouseleave="canDelete = false"
  >
    <img
      :src="`/assets/images/${props.product.images[0]}`"
      width="48px"
      height="48px"
      class="rounded-sm"
    />
    <span
      class="text-2xl self-center min-w-0 max-w-xs flex-shrink whitespace-nowrap overflow-hidden"
      >{{ props.product.name }}</span
    >
    <span class="text-xl self-center text-purple-900 underline"
      >{{ props.product.price }}$</span
    >
    <button
      v-if="canDelete"
      @click="cart.deleteItem(props.product)"
      class="hover:cursor-pointer"
    >
      x
    </button>
  </div>
</template>
