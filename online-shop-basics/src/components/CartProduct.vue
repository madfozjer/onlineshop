<script setup>
import { defineProps } from "vue";

const props = defineProps({
  name: String,
  parameters: Array,
  price: Number,
  image: String,
});
</script>

<template>
  <div class="flex gap-2 hover:cursor-pointer hover:bg-gray-100">
    <img
      :src="`/assets/images/${props.image}`"
      width="48px"
      height="48px"
      class="rounded-sm"
    />
    <span
      class="text-2xl self-center min-w-0 max-w-xs flex-shrink whitespace-nowrap overflow-hidden"
      >{{ name }}</span
    >
    <span class="text-xl self-center text-purple-900 underline"
      >{{ price }}$</span
    >
  </div>
</template>
