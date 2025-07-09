<template>
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
        <div v-for="collection in collections.collections">
          <span class="font-mono">{{ collection.name }}</span>
          <br />
          <div class="flex gap-2 border-t-2 border-gray-800 py-2 mb-1">
            <div v-for="id in collection.items">
              <DashboardProduct :item="products.getItem(id)" />
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
const collections = useCollections();
const products = useProductsList();

const emit = defineEmits(["close"]);
</script>
