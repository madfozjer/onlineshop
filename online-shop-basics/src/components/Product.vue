<template>
  <div class="inline-block m-4 p-2 hover:cursor-pointer hover:bg-gray-100">
    <img
      :src="`/assets/images/${props.image}`"
      width="200px"
      height="295px"
      class="rounded-md"
    />
    {{ name }}<br />
    <div class="font-semibold">
      <template v-for="(item, index) in props.parameters">
        <template v-if="index > 0"> · </template>
        <span>{{ item }}</span>
      </template>
    </div>
    <div class="flex gap-2">
      <div class="text-md text-purple-900 underline">{{ price }}$</div>
      <button
        class="hover:cursor-pointer bg-gray-200 w-auto p-0.5 rounded-md border-1 hover:bg-gray-300 shadow-2xl text-sm z-10"
        @click.stop="cart.addItem(product)"
      >
        🛒
      </button>
    </div>
  </div>
</template>

<script setup>
import { useCart } from "@/stores/cart";

const cart = useCart();

const props = defineProps({
  name: String,
  parameters: Array,
  price: Number,
  image: String,
  id: String,
});

const product = {
  name: props.name,
  parameters: props.parameters,
  price: props.price,
  image: props.image,
};
</script>
