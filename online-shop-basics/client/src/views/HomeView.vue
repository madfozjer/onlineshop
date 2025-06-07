<script setup>
import Product from "@/components/Product.vue";
import Navigation from "@/components/Navigation.vue";
import { ref } from "vue";
import router from "@/router/router";
import { useProductsList } from "@/stores/products";
import { useCollections } from "@/stores/colections";

const products = useProductsList();
const collectionsStore = useCollections();
const collections = collectionsStore.collections;
const list = products.getList();

const packVisibility = ref([]);
const itemsFiltered = ref(false);
const filterActive = ref(false);

collections.forEach((collection) => {
  packVisibility.value.push(true);
});

const filteredProducts = ref([]);
const searchWord = ref("");
const searchTags = ref([]);

const receiveSearch = ({ value }) => {
  searchWord.value = value;
  filteredProducts.value = search(value);
};

function search(query) {
  searchTags.value = [];
  products.tags.forEach((tag) => {
    if (
      tag.includes(query.toLowerCase()) &&
      query.length > 2 &&
      query.toLowerCase() != tag
    )
      searchTags.value.push(tag);
  });

  products.productNames.forEach((name) => {
    if (
      name.toLowerCase().includes(query.toLowerCase()) &&
      query.length > 2 &&
      query.toLowerCase() != name.toLowerCase()
    ) {
      searchTags.value.push(name);
    }
  });
  return list.filter(
    (product) =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.tags.includes(query.toLowerCase())
  );
}

function filter(param) {
  if (itemsFiltered.value == true) {
    itemsFiltered.value = false;
  } else {
    filteredProducts.value = list.filter((item) =>
      item.paramaters.includes(param)
    );

    itemsFiltered.value = true;
  }
}
</script>

<template>
  <Navigation
    @new-search="receiveSearch"
    :res="searchTags"
    :home-access="true"
  />
  <div class="ml-8">
    <div
      v-for="(pack, index) in collections"
      class="ml-6 mt-4"
      v-if="searchWord == ''"
    >
      <div class="flex gap-4">
        <span
          class="text-4xl font-light pb-2 border-dotted"
          :class="{ 'border-b-2': !packVisibility[index] }"
          >{{ pack.name }}</span
        >
        <button
          class="text-2xl align-middle hover:font-semibold hover:cursor-pointer"
          @click="packVisibility[index] = !packVisibility[index]"
        >
          {{ packVisibility[index] ? "-" : "+" }}
        </button>
      </div>
      <div
        class="flex gap-2 -ml-6 border-1 mt-2 rounded-md mr-6"
        v-if="packVisibility[index]"
      >
        <Product
          v-for="item in pack.items"
          :name="products.getItem(item).name"
          :id="item"
          :parameters="products.getItem(item).paramaters"
          :price="products.getItem(item).price"
          :image="
            products.getItem(item).images != undefined
              ? products.getItem(item).images[0]
              : null
          "
          @click="router.push(`/items/${item}`)"
        ></Product>
      </div>
    </div>
    <button
      class="border-1 border-solid rounded-md text-3xl px-1 bg-blue-300 border-black m-4 -mb-2 hover:bg-blue-400 hover:cursor-pointer absolute"
      @click="filterActive = !filterActive"
    >
      =
    </button>
    <div v-if="filterActive" class="border-1 rounded-md w-fit p-4 ml-4 mt-16">
      <span class="font-semibold text-xl">Colors:</span>
      <div class="flex-col flex">
        <span
          v-for="color in products.params.colors"
          class="hover:font-semibold hover:cursor-pointer"
          :style="{ color: color != 'White' ? color : 'Purple' }"
          @click="filter(color)"
        >
          - {{ color }}</span
        >
      </div>
    </div>
    <Product
      v-if="searchWord != '' || itemsFiltered"
      v-for="(item, index) in filteredProducts"
      :name="item.name"
      :parameters="item.paramaters"
      :price="item.price"
      :id="item.id"
      :image="item.images[0]"
      @click="router.push(`/items/${item.id}`)"
    />
    <div class="border-t-1 border-dotted mr-8">
      <div>
        <Product
          v-if="searchWord == '' && !itemsFiltered"
          v-for="(item, index) in list"
          :name="item.name"
          :id="item.id"
          :parameters="item.paramaters"
          :price="item.price"
          :image="item.images != undefined ? item.images[0] : null"
          @click="router.push(`/items/${item.id}`)"
        />
      </div>
    </div>
  </div>
</template>
