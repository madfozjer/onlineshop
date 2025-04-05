<script setup>
useProductsList;
import { useProductsList } from "@/stores/products";
import { useCart } from "@/stores/cart";
import { useRoute } from "vue-router";
const products = useProductsList();
const cart = useCart();
const route = useRoute();

import Navigation from "./Navigation.vue";

const id = route.params.id;

const product = products.getItem(id) != 404 ? products.getItem(id) : undefined;
</script>

<template>
  <Navigation />
  <div class="m-6 flex justify-center items-center" v-if="product != 404">
    <div id="images" class="flex border-2">
      <img
        :src="`/assets/images/${product.images[0]}`"
        width="400px"
        height="399px"
        class="border-2 border-white"
      />

      <div class="flex flex-col">
        <img
          :src="`/assets/images/${product.images[0]}`"
          width="200px"
          height="195px"
          class="border-2 border-white"
        />

        <img
          :src="`/assets/images/${product.images[0]}`"
          width="200px"
          height="195px"
          class="border-2 border-white"
        />
      </div>
    </div>
    <div
      id="description"
      class="rounded-md shadow-md border-2 border-gray-600 p-2 ml-16"
    >
      <span class="text-3xl">{{ product.name }}</span
      ><br />
      -
      <span class="text-2xl text-purple-900 underline"
        >{{ product.price }}$</span
      >
      <span class="ml-2 text-xl">
        <template v-for="(item, index) in product.paramaters">
          <template v-if="index > 0"> · </template>
          <span>{{ item }}</span>
        </template>
      </span>
      <div
        class="max-w-98 text-sm italic mt-2"
        v-if="product.description != ``"
      >
        '{{ product.description }}'
      </div>
      <div class="text-sm text-gray-700">
        <template v-for="(item, index) in product.tags">
          <span> #{{ item }}</span>
          <template v-if="index < product.tags.length - 1">,</template>
        </template>
      </div>
      <button
        class="border-2 border-gray-700 rounded-md text-3xl p-1 bg-blue-300 text-white mt-2 hover:cursor-pointer"
      >
        buy now
      </button>
      <button
        class="border-2 border-gray-700 rounded-md text-3xl p-1 bg-green-300 text-white ml-2 hover:cursor-pointer"
        @click="cart.addItem(product)"
      >
        add to cart
      </button>
    </div>
  </div>
</template>

<!-- images v-if'ing -->
