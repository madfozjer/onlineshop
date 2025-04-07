<script setup>
import { useProductsList } from "@/stores/products";
import { ref } from "vue";
import randomColor from "randomcolor";
const products = useProductsList();

defineProps({
  logDesc: Function,
});
</script>

<template>
  <div
    v-for="item in products.list"
    class="border-2 rounded-md border-gray-700 shadow-xl m-2 text-center p-2"
  >
    <img
      :src="`/assets/images/${item.images[0]}`"
      width="150px"
      height="150px"
      class="rounded-sm mx-auto block border-2 shadow-sm border-gray-200"
    />
    <button
      class="hover:cursor-pointer"
      @click="logDesc(item.description, randomColor())"
    >
      DESC</button
    ><button
      class="ml-4 hover:cursor-pointer"
      @click="products.deleteItem(item.id)"
    >
      X</button
    ><br />

    <span>{{ item.name }}</span>
    [<span class="underline">{{ item.id }}</span
    >]
  </div>
</template>
