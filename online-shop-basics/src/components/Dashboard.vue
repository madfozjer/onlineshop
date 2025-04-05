<script setup>
import { useProductsList } from "@/stores/products";
import { nanoid } from "nanoid";
import { ref, watch } from "vue";

const products = useProductsList();

const newItem = ref({
  index: products.getLength(),
  id: nanoid(5),
  name: "",
  paramaters: [],
  tags: [],
  price: 60.0,
  images: [],
  description: ``,
});

const deleteItemID = ref("");
const findIdName = ref("");
const outputID = ref("");

const debug = ref([]);

function log(text, color) {
  debug.value.push("<span style='color:" + color + "'>" + text + "</span>");
  debug.value = [...debug.value];
}

watch(debug, (arr) => {
  if (arr.length > 5) clearDebug();
});

function clearDebug() {
  debug.value = [];
}

function addItem() {
  newItem.value.paramaters = newItem.value.paramaters.split("-");
  newItem.value.tags = newItem.value.tags.split("#");
  newItem.value.images = newItem.value.images.split("/");

  log(products.addItem(newItem.value), "purple");
  newItem.value = {
    index: products.getLength(),
    id: nanoid(),
    name: "",
    paramaters: [],
    tags: [],
    price: 0.0,
    images: [],
    description: ``,
  };

  log(products.list);
}

const formFilled = () => {
  if (
    newItem.value.name != "" &&
    newItem.value.price != 0.0 &&
    newItem.value.images != ""
  )
    return true;
  else return false;
};
</script>

<template>
  <div class="p-8 w-screen overflow-hidden">
    <div class="border-2 border-gray-800 shadow-md block w-[30%] p-2">
      <span class="font-bold">Add new item:</span>
      <form>
        Name:
        <input
          type="text"
          required
          placeholder="Vintage Adidas T-Shirt.."
          class="border-2 border-gray-700 p-1 mt-2"
          v-model="newItem.name"
        /><br />
        Parameters:
        <input
          type="text"
          required
          placeholder="M-Good-Eco"
          class="border-2 border-gray-700 p-1 mt-2"
          v-model="newItem.paramaters"
        /><br />
        Tags:
        <input
          type="text"
          required
          placeholder="#T-shirt#tshirt#retro"
          class="border-2 border-gray-700 p-1 mt-2"
          v-model="newItem.tags"
        /><br />
        <label for="description">Description:</label><br />
        <textarea
          id="description"
          required
          class="border-2 border-gray-700 p-1 mt-2 w-full text-xs"
          v-model="newItem.description"
        ></textarea
        ><br />
        Price:
        <input
          type="number"
          required
          class="border-2 border-gray-700 p-1 mt-2"
          v-model="newItem.price"
        /><br />
        Images:
        <input
          type="string"
          required
          placeholder="image1.jpg/image2.jpg"
          class="border-2 border-gray-700 p-1 mt-2"
          v-model="newItem.images"
        /><br />
        <input
          v-if="formFilled()"
          class="border-2 border-gray-700 p-1 bg-gray-100 shadow-md mt-2 hover:cursor-pointer"
          type="submit"
          @click.prevent="addItem"
          value="add new item"
        />
      </form>
    </div>
    <div class="border-2 border-gray-800 shadow-md block w-[30%] p-2 mt-4">
      <form>
        <span class="font-bold">Delete item:</span>
        <input
          class="ml-2"
          type="text"
          v-model="deleteItemID"
          placeholder="Enter item id..."
        />
        <input
          type="submit"
          @click.prevent="log(products.deleteItem(deleteItemID), 'green')"
          value="submit"
          class="border-2 border-gray-800 p-1"
        />
      </form>
    </div>
    <div class="border-2 border-gray-800 shadow-md block w-[30%] p-2 mt-4">
      <form>
        <span class="font-bold">Get id:</span>
        <input
          class="ml-2"
          type="text"
          v-model="findIdName"
          placeholder="Enter item name..."
        />
        <input
          type="submit"
          @click.prevent="outputID = products.getId(findIdName)"
          value="submit"
          class="border-2 border-gray-800 p-1"
        />
      </form>
      <span> {{ outputID != "" ? outputID : "nothing" }}</span>
    </div>
    <button
      @click="
        products.resetStore();
        log('Store has been reseted!', 'red');
      "
    >
      reset products list
    </button>
    <button
      @click="
        log(JSON.stringify(products.getList()), 'black');
        console.log(products.getList());
      "
      class="ml-4"
    >
      get list
    </button>
    <button @click="clearDebug" class="ml-4">clear console</button>
    <div
      class="border-2 border-dotted border-green-800 w-auto overflow-hidden block mr-8"
    >
      <div v-for="msg in debug" class="w-auto pr-2 pl-1" v-html="msg"></div>
    </div>
  </div>
</template>
