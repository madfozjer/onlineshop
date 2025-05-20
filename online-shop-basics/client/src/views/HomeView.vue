<script setup>
import Product from "@/components/Product.vue";
import Navigation from "@/components/Navigation.vue";
import { ref } from "vue";
import router from "@/router/router";
import { useProductsList } from "@/stores/products";

const products = useProductsList();
const list = products.getList();

const filteredProducts = ref([]);
const searchWord = ref("");

const receiveSearch = ({ value }) => {
  searchWord.value = value;
  filteredProducts.value = search(value);
};

function search(query) {
  return list.filter(
    (product) =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.tags.includes(query.toLowerCase())
  );
}
</script>

<template>
  <Navigation @new-search="receiveSearch" />
  <div class="ml-8">
    <Product
      v-if="searchWord != ''"
      v-for="(item, index) in filteredProducts"
      :name="item.name"
      :parameters="item.paramaters"
      :price="item.price"
      :id="item.id"
      :image="item.images[0]"
      @click="router.push('/items/${item.id}')"
    />
    <Product
      v-if="searchWord == ''"
      v-for="(item, index) in list"
      :name="item.name"
      :id="item.id"
      :parameters="item.paramaters"
      :price="item.price"
      :image="item.images != undefined ? item.images[0] : null"
      @click="router.push(`/items/${item.id}`)"
    />
    <!--<button @click="console.log(products.getList())">Get list</button>-->
    <!-- migrate some components to views -->
    <!-- databse + clear version -->
  </div>
</template>
