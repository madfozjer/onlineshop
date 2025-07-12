<template>
  <!-- Popup that appears when clicked on dashboard 'get collections' -->
  <div class="relative">
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      <div
        class="bg-white text-2xl font-semibold p-6 rounded-lg shadow-md border"
      >
        <span
          class="ml-auto text-red-800 font-bold hover:cursor-pointer"
          @click="$emit('close')"
          >x</span
        >
        <!-- Allows to close popup -->
        <div v-for="collection in collections.collections">
          <!-- Div for every collection -->
          <span class="font-mono">{{ collection.name }}</span>
          <!-- Displays name for every collection -->
          <br />
          <div class="flex gap-2 border-t-2 border-gray-800 py-2 mb-1">
            <div v-for="id in collection.items">
              <DashboardProduct
                :item="products.getItem(id)"
                class="border-2 border-dotted border-gray-600 opacity-85 p-2"
              />
              <!-- For every item in collection, displays it -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from "vue";
import { useCollections } from "@/stores/colections";
import { useProductsList } from "@/stores/products";
import DashboardProduct from "./DashboardProduct.vue";
const collections = useCollections(); // Gets collections from store
const products = useProductsList(); // Gets products to receive item from store

const emit = defineEmits(["close"]);
</script>
