<script setup>
import { useProductsList } from "@/stores/products";
import { nanoid } from "nanoid";
import { ref, watch } from "vue";
import Product from "@/components/DashboardProduct.vue";
import { RouterLink } from "vue-router";
import { useCart } from "@/stores/cart";
import { useCollections } from "@/stores/colections";
import CollectionsPopup from "@/components/CollectionsPopup.vue";
const collections = useCollections();
const products = useProductsList();
const cart = useCart();

const loggedIn = ref(false);
console.log(localStorage.getItem("authToken"));
loggedIn.value = await products.auth();
const password = ref("");
const wrongPassword = ref(false);

const collectionPopupBoolean = ref(false);

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

async function login() {
  const res = await products.login(password.value);

  if (res != 200) wrongPassword.value = true;
  else {
    loggedIn.value = true;
    wrongPassword.value = false;
  }
}

const deleteItemID = ref("");
const findIdName = ref("");
const outputID = ref("");

const newCollectionName = ref("");
const newCollectionItems = ref([]);

const deleteCollectionID = ref("");

const newTagName = ref("");
const deleteTagName = ref("");

const debug = ref([]);

function log(text, color) {
  debug.value.push("<span style='color:" + color + "'>" + text + "</span>");
  debug.value = [...debug.value];
}

function popup(text) {
  alert(text);
}

watch(debug, (arr) => {
  if (arr.length > 5) clearDebug();
});

function clearDebug() {
  debug.value = [];
}

function addItem() {
  newItem.value.paramaters = newItem.value.paramaters.split("/");
  newItem.value.tags = newItem.value.tags.split("#");
  newItem.value.tags.shift();
  newItem.value.images = newItem.value.images.split("/");
  products.postProduct(newItem.value);
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

function handleNewCollection() {
  newCollectionItems.value = newCollectionItems.value.split("#");
  newCollectionItems.value.shift();

  if (
    !collections.addCollection(
      newCollectionName.value,
      newCollectionItems.value
    )
  )
    popup("Error occured during adding new collection");
  else popup(`New collection ${newCollectionName.value} was added`);
}

function handleDeleteProduct(deleteItemID) {
  areYouSure(() => {
    // This anonymous function will be executed if the user confirms
    if (products.deleteItem(deleteItemID))
      popup(`Item ${deleteItemID} was deleted succesfully`);
    else popup(`Failed to delete ${deleteItemID} item`);
  }, "Are you sure you want to delete this item?");
}

function handleAddNewTag(newTagName) {
  if (products.postTag(newTagName)) {
    popup(products.addTag(newTagName));
  } else {
    popup(`Error inserting new tag: ${newTagName}`);
  }
}

function handleDeleteTag(deleteTagName) {
  popup(products.deleteTag(deleteTagName));
}

function handleDeleteCollection() {
  if (deleteCollectionID.value) {
    areYouSure(() => {
      collections.deleteCollection(deleteCollectionID.value);
    }, "Are you sure you want to delete this collection?");
  } else {
    alert("No collection to delete found");
  }
}

function areYouSure(callback, message = "Are you sure?") {
  if (typeof callback !== "function") {
    console.error("areYouSure: The first argument must be a function.");
    return;
  }

  if (confirm(message)) {
    callback();
  } else {
    console.log("Action cancelled by user.");
  }
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
  <CollectionsPopup
    v-if="collectionPopupBoolean"
    @close="collectionPopupBoolean = false"
  />
  <div v-if="loggedIn">
    <RouterLink
      to="/"
      class="ml-8 inline-block mt-8 border-2 border-dotted border-gray-400 shadow-sm p-2"
      >Go to Home -></RouterLink
    >
    <div class="flex w-screen h-fit shrink">
      <div class="p-8 w-[50%] overflow-hidden">
        <div class="border-2 border-gray-800 shadow-md block p-2">
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
            <span class="italic font-mono opacity-75 text-sm"
              >(size)/(color)/(type) like M/White/T-Shirt and only after that
              you can add other things like /Eco/Good</span
            ><br />
            Parameters:
            <input
              type="text"
              required
              placeholder="M/White/T-Shirt"
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
              class="border-2 border-gray-700 p-1 mt-2 text-xs w-96"
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
              @click.prevent="(addItem(), popup('Item added successfully'))"
              value="add new item"
            />
          </form>
        </div>
        <div class="border-2 border-gray-800 shadow-md block p-2 mt-4">
          <form>
            <span class="font-bold">Delete item:</span>
            <input
              class="ml-2"
              type="text"
              v-model="deleteItemID"
              placeholder="Enter item id..."
            />
            <input
              v-if="deleteItemID"
              type="submit"
              @click.prevent="handleDeleteProduct(deleteItemID)"
              value="submit"
              class="border-2 border-gray-800 p-1"
            />
          </form>
        </div>
        <div class="border-2 border-gray-800 shadow-md block p-2 mt-4">
          <form>
            <span class="font-bold">Get id:</span>
            <input
              class="ml-2 text-[12px]"
              type="text"
              v-model="findIdName"
              placeholder="Enter item name.."
            />
            <input
              type="submit"
              v-if="findIdName != ''"
              @click.prevent="outputID = products.getId(findIdName)"
              value="submit"
              class="border-2 border-gray-800 p-1"
            /><br />
            <span class="italic">{{
              outputID != "" ? outputID : "nothing"
            }}</span>
          </form>
        </div>
        <div class="border-2 border-gray-800 shadow-md p-2 mt-4 block">
          <form class="flex flex-col gap-1">
            <span class="font-bold">Create new collection:</span>
            <input
              class="text-md"
              type="text"
              v-model="newCollectionName"
              placeholder="Enter new collection name here..."
            />
            <input
              class="text-md"
              type="text"
              v-model="newCollectionItems"
              placeholder="Enter new collection items (ids) here separated by #, like #ppdr7#joko5..."
            />
            <input
              v-if="newCollectionName != '' && newCollectionItems != ''"
              @click.prevent="handleNewCollection()"
              value="submit"
              type="submit"
              class="border-2 border-gray-800 p-1 w-fit"
            />
          </form>
        </div>
        <div class="border-2 border-gray-800 shadow-md p-2 mt-4 block">
          <form class="flex flex-col gap-1">
            <span class="font-bold">Delete collection</span>
            <input
              type="text"
              class="text-md"
              v-model="deleteCollectionID"
              placeholder="Enter collection to delete name her.."
            />
            <input
              v-if="deleteCollectionID"
              type="submit"
              value="submit"
              @click.prevent="handleDeleteCollection()"
              class="border-2 border-gray-800 p-1 w-fit"
            />
          </form>
        </div>
        <div class="border-2 border-gray-800 shadow-md p-2 mt-4 block">
          <form class="flex flex-col gap-1">
            <span class="font-bold">Add new search (under search bar) tag</span>
            <input
              type="text"
              class="text-md pl-1"
              v-model="newTagName"
              placeholder="Enter new tag name there.."
            />
            <input
              v-if="newTagName"
              type="submit"
              value="submit"
              @click.prevent="handleAddNewTag(newTagName)"
              class="border-2 border-gray-800 p-1 w-fit hover:cursor-pointer"
            />
          </form>
        </div>
        <div class="border-2 border-gray-800 shadow-md p-2 mt-4 block">
          <form class="flex flex-col gap-1">
            <span class="font-bold">Delete search tag</span>
            <input
              type="text"
              class="text-md pl-1"
              v-model="deleteTagName"
              placeholder="Enter tag to delete name there.."
            />
            <input
              v-if="deleteTagName"
              type="submit"
              value="submit"
              @click.prevent="handleDeleteTag(deleteTagName)"
              class="border-2 border-gray-800 p-1 w-fit hover:cursor-pointer"
            />
          </form>
        </div>
        <button
          @click="
            products.resetStore();
            cart.saveToStorage();
            log('Store has been reseted!', 'red');
          "
          class="hover:cursor-pointer"
        >
          reset products list
        </button>
        <button
          @click="
            log(JSON.stringify(products.getList()), 'white');
            console.log(products.getList());
          "
          class="ml-4 hover:cursor-pointer"
        >
          get list
        </button>
        <button @click="clearDebug" class="ml-4 hover:cursor-pointer">
          clear console
        </button>
        <button
          @click="collectionPopupBoolean = true"
          class="ml-4 hover:cursor-pointer"
        >
          get collections
        </button>
      </div>

      <div
        class="mt-8 overflow-y-scroll border-dotted border-2 border-gray-300 max-h-[80%]"
      >
        <div
          v-for="item in products.list"
          class="border-2 rounded-md border-gray-700 shadow-xl m-2 text-center p-2"
        >
          <Product
            :item="item"
            :logDesc="log"
            @deleteproduct="handleDeleteProduct(item.id)"
          />
        </div>
      </div>
    </div>
    <div
      class="border-2 border-dotted border-green-800 overflow-hidden min-h-16 mt-4 inline-block ml-32 mr-32 w-[80%] bg-gray-800"
    >
      <div
        v-for="msg in debug"
        class="inline-block text-sm mt-1"
        v-html="msg"
      ></div>
    </div>
  </div>
  <div
    v-if="!loggedIn"
    class="flex flex-col justify-center items-center min-h-screen"
  >
    <span class="text-4xl mb-4 font-thin">You need to login</span>
    <input
      type="text"
      class="border-1 p-2 text-2xl rounded-md"
      placeholder="Your password here..."
      v-model="password"
      @input="wrongPassword = false"
      @keydown.enter="
        login();
        password = '';
      "
    />
    <input
      type="submit"
      class="border-1 border-dotted hover:cursor-pointer p-2 text-sm mt-4 rounded-md"
      value="Log in"
      v-if="password != ''"
      @click="login()"
    />
    <span v-if="wrongPassword" class="text-md mt-2 text-red-700"
      >Password is wrong.</span
    >
  </div>
</template>
