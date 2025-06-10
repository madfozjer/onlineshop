<script setup>
import Product from "@/components/Product.vue";
import Navigation from "@/components/Navigation.vue";
import { ref, watch } from "vue";
import router from "@/router/router";
import { useProductsList } from "@/stores/products";
import { useCollections } from "@/stores/colections";

const products = useProductsList();
const collectionsStore = useCollections();
const collections = collectionsStore.collections;
const list = products.getList();

const packVisibility = ref([]);
const filterActive = ref(false);
const sortMenuActive = ref(false);
const itemsFiltered = ref(false);

var params = ref([]);
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

  itemsFiltered.value = true;

  return list.filter(
    (product) =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.tags.includes(query.toLowerCase())
  );
}

function filterClick(type) {
  if (params.value.includes(type)) {
    params.value = params.value.filter((item) => item !== type);
  } else {
    params.value.push(type);
    itemsFiltered.value = true;
  }
  filter();
}

function reverseSortBy(method, list) {
  list.sort((a, b) => {
    if (a[method] < b[method]) {
      return 1;
    }
    if (a[method] > b[method]) {
      return -1;
    }
    return 0;
  });

  return list;
}

function sortBy(method, list) {
  list.sort((a, b) => {
    if (a[method] < b[method]) {
      return -1;
    }
    if (a[method] > b[method]) {
      return 1;
    }
    return 0;
  });

  return list;
}

function sortProducts(method, list) {
  switch (method) {
    case "reverseName":
      list = reverseSortBy("name", list);
      break;
    case "name":
      list = sortBy("name", list);
      break;
    case "reversePrice":
      list = reverseSortBy("price", list);
      break;
    case "price":
      list = sortBy("price", list);
      break;
    default:
      list = sortBy("name", list);
  }
}

function filter() {
  filteredProducts.value = list;

  list.forEach((toRemove) => {
    toRemove.paramaters.forEach((param) => {
      if (params.value.includes(param)) {
        filteredProducts.value = filteredProducts.value.filter(
          (item) => item !== toRemove
        );
      }
    });
  });

  if (params.value.length === 0) {
    itemsFiltered.value = false;
  }
}
</script>

<template>
  <span v-if="searchWord == ''" @load="itemsFiltered = false"></span>
  <Navigation
    @new-search="receiveSearch"
    :res="searchTags"
    :home-access="true"
  />
  <div class="ml-8">
    <!--<div
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
  -->
    <button
      class="border-1 border-solid rounded-md text-3xl px-1 bg-blue-300 border-black m-4 -mb-2 hover:bg-blue-400 hover:cursor-pointer absolute"
      @click="filterActive = !filterActive"
      v-if="!sortMenuActive"
    >
      =
    </button>
    <button
      class="border-1 border-solid rounded-md text-3xl px-1 bg-green-300 border-black m-4 ml-14 mb-2 hover:bg-green-400 hover:cursor-pointer absolute"
      @click="sortMenuActive = !sortMenuActive"
      v-if="!filterActive"
    >
      sort
    </button>
    <div v-if="filterActive" class="border-1 rounded-md w-fit p-4 ml-4 mt-16">
      <span class="font-semibold text-xl">Colors:</span>
      <div class="flex-col flex">
        <span
          v-for="color in products.params.colors"
          class="hover:font-semibold hover:cursor-pointer"
          :style="{ color: color != 'White' ? color : 'Purple' }"
          @click="filterClick(color)"
          ><input
            type="checkbox"
            :checked="!params.includes(color)"
            class="hover:cursor-pointer"
          />
          {{ color }}</span
        >
        <span class="font-semibold text-xl">Types:</span>
        <span
          v-for="type in products.params.types"
          :style="{
            color:
              type == 'T-Shirt'
                ? 'green'
                : type == 'Jacket'
                  ? 'darkblue'
                  : null,
          }"
          class="hover:font-semibold hover:cursor-pointer"
          @click="filterClick(type)"
        >
          <input
            type="checkbox"
            :checked="!params.includes(type)"
            class="hover:cursor-pointer"
          />
          {{ type }}</span
        >
      </div>
      <span class="font-semibold text-xl">Size:</span>
      <span
        v-for="size in products.params.sizes"
        class="hover:font-semibold hover:cursor-pointer"
        @click="filterClick(size)"
      >
        &nbsp;<input
          type="checkbox"
          :checked="!params.includes(size)"
          class="hover:cursor-pointer"
        />
        {{ size }}</span
      >
    </div>
    <div
      v-if="sortMenuActive && !filterActive"
      class="border-1 rounded-md w-fit p-4 ml-4 mt-16 flex flex-col gap-2"
    >
      <span
        class="hover:font-semibold hover:cursor-pointer"
        @click="sortProducts('name', list)"
        >From A to Z</span
      >

      <span
        class="hover:font-semibold hover:cursor-pointer"
        @click="sortProducts('reverseName', list)"
        >From Z to A</span
      >

      <span
        class="hover:font-semibold hover:cursor-pointer"
        @click="sortProducts('price', list)"
        >From lowest to highest price</span
      >

      <span
        class="hover:font-semibold hover:cursor-pointer"
        @click="sortProducts('reversePrice', list)"
        >From highest to lowest price</span
      >
    </div>
    <Product
      v-if="itemsFiltered"
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
          v-if="itemsFiltered == false"
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
