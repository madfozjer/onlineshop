<template>
  <div
    class="sticky border-b-2 border-gray-200 pt-4 pb-4 shrink-0 flex flex-col"
  >
    <div class="flex gap-4 justify-center">
      <div
        class="ml-8 text-2xl hover:cursor-pointer"
        @click="
          router.push({ name: 'Home' });
          search = '';
        "
      >
        OurShop
      </div>
      <div
        class="flex flex-col relative"
        @mouseover="accesingSearch = true"
        @mouseleave="accesingSearch = false"
      >
        <div class="border-2 border-gray-200 flex gap-0.5 focus:outline-0">
          <button class="p-0.5">⌕</button>
          <input
            type="text"
            placeholder="Search.."
            class="pl-1 pr-1 w-96"
            v-model="search"
          />
        </div>
        <div class="flex flex-col z-10 absolute top-7 mr-4 mt-1">
          <span
            v-if="accesingSearch"
            v-for="item in props.res.slice(0, 5)"
            class="border-2 border-dotted w-101 p-1 bg-white mt-1 hover:bg-gray-100 hover:cursor-pointer"
            v-html="highlight(item)"
            @click="search = item"
          ></span>
        </div>
      </div>
      <button
        class="hover:cursor-pointer bg-gray-200 border-2 rounded-2xl shadow-2xl p-1 border-gray-400 hover:bg-gray-300"
        @click="cartAccesed = !cartAccesed"
      >
        Cart🛒
      </button>
      <Cart v-if="cartAccesed" @close-cart="cartAccesed = false" />
    </div>
    <div
      class="flex justify-center text-xl gap-10 font-thin"
      v-if="props.homeAccess"
    >
      <span
        class="hover:font-medium hover:cursor-pointer"
        v-for="tag in tags"
        @click="search = tag"
        >{{ tag }}</span
      >
    </div>
  </div>
</template>

<script setup>
import { watch, defineEmits, ref, defineProps, computed } from "vue";
import Cart from "./Cart.vue";
import router from "@/router/router";

const accesingSearch = ref(false);

const tags = ["T-Shirt", "Retro"];

const props = defineProps({
  res: Array,
  homeAccess: Boolean,
});

const highlight = computed(() => (full) => {
  const searchText = search.value;
  if (!searchText || !full.includes(searchText)) {
    return full;
  }

  const regex = new RegExp(searchText, "gi");
  return full.replace(
    regex,
    (match) => `<span class='font-semibold'>${match}</span>`
  );
});

var search = ref("");
const cartAccesed = ref(false);

const emit = defineEmits();

watch(search, (value) => {
  emit("new-search", {
    value: value,
  });
});
</script>
