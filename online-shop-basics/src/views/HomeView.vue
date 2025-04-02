<script setup>
import Product from "@/components/Product.vue";
import Navigation from "@/components/Navigation.vue";
import { ref } from "vue";

const products = [
  {
    index: 0,
    name: "Autoboy Vintage T-Shirt",
    paramaters: ["M", "Good"],
    price: "40.00",
    image: "autoboy-tee1.jpg",
  },
  {
    index: 1,
    name: "Disney Pizza Vintage T-Shirt",
    paramaters: ["S", "New"],
    price: "70.00",
    image: "disney-pizza-tee1.jpg",
  },
];
const filteredProducts = ref([]);
const searchWord = ref("");

const receiveSearch = ({ value }) => {
  searchWord.value = value;
  filteredProducts.value = search(value);
};

function search(query) {
  return products.filter((product) =>
    product.name.toLowerCase().includes(query.toLowerCase())
  );
}
</script>

<template>
  <div class="ml-8">
    <Navigation @new-search="receiveSearch" />
    <Product
      v-if="searchWord != ''"
      v-for="item in filteredProducts"
      :name="item.name"
      :parameters="item.paramaters"
      :price="item.price"
      :image="item.image"
    />
    <Product
      v-if="searchWord == ''"
      v-for="item in products"
      :name="item.name"
      :parameters="item.paramaters"
      :price="item.price"
      :image="item.image"
    />
  </div>
</template>
