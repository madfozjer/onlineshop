<template>
  <div
    class="sticky border-b-2 justify-center border-gray-200 pt-4 pb-4 gap-4 shrink-0 flex"
  >
    <div
      class="ml-8 text-2xl hover:cursor-pointer"
      @click="router.push({ name: 'Home' })"
    >
      OurShop
    </div>
    <div class="border-2 border-gray-200 flex gap-0.5 focus:outline-0">
      <button class="p-0.5">⌕</button>
      <input
        type="text"
        placeholder="Search.."
        class="pl-1 pr-1 w-96"
        v-model="search"
      />
    </div>
    <button
      class="hover:cursor-pointer bg-gray-200 border-2 rounded-2xl shadow-2xl p-1 border-gray-400 hover:bg-gray-300"
      @click="cartAccesed = !cartAccesed"
    >
      Cart🛒
    </button>
    <Cart v-if="cartAccesed" @close-cart="cartAccesed = false" />
  </div>
</template>

<script setup>
import { watch, defineEmits, ref } from "vue";
import Cart from "./Cart.vue";
import router from "@/router/router";

var search = ref("");
const cartAccesed = ref(false);

const emit = defineEmits();

watch(search, (value) => {
  emit("new-search", {
    value: value,
  });
});
</script>
