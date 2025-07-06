<script setup>
import { useProductsList } from "@/stores/products";
import e from "cors";
import { ref } from "vue";

const products = useProductsList();

const loggedIn = ref(false);
const onlyResolved = ref(false);

loggedIn.value = await products.auth();

const password = ref("");
const wrongPassword = ref(false);

async function login() {
  const res = await products.login(password.value);

  if (res != 200) wrongPassword.value = true;
  else {
    loggedIn.value = true;
    wrongPassword.value = false;
  }
}

const orders = ref([]);
orders.value = await products.getAPI("allorders");

async function resolveOrder(id) {
  const response = await products.resolveOrder(id);
  if (response) {
    orders.value = await products.getAPI("allorders");
  }
}

async function deleteOrder(id) {
  const response = await products.deleteOrder(id);
  if (response) {
    orders.value = await products.getAPI("allorders");
  }
}
</script>

<template>
  <div v-if="loggedIn" class="m-4">
    <div class="fixed right-0 mr-6">
      <button
        @click="onlyResolved = !onlyResolved"
        class="border rounded-md bg-white p-1 hover:cursor-pointer text-xl shadow-md opacity-50 hover:opacity-95"
      >
        {{ onlyResolved ? "All orders" : "Only not resolved" }}
      </button>
    </div>
    <RouterLink
      to="/"
      class="ml-8 inline-block mt-8 border-2 border-dotted border-gray-400 shadow-sm p-2"
      >Go to Home -></RouterLink
    >
    <div v-for="order in orders">
      <div
        v-if="onlyResolved ? order.status !== 'RESOLVED' : order.status"
        class="bg-white shadow-lg rounded-lg p-4 m-2 flex flex-col space-y-3 border border-gray-200"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold text-gray-800 underline">
            {{ order.orderId }}
          </h3>
          <span
            class="px-3 py-1 rounded-full text-sm font-semibold"
            :class="
              order.status === 'RESOLVED'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            "
          >
            {{ order.status }}
          </span>
        </div>

        <div class="text-gray-600">
          <p class="text-sm">
            <strong>Order Date:</strong>
            {{ new Date(order.createdAt).toLocaleString() }}
          </p>
        </div>

        <div class="border-t border-gray-200 pt-3">
          <p class="text-gray-700 font-semibold mb-2">Items:</p>
          <ul class="list-disc list-inside text-gray-600 pl-4">
            <li v-for="item in order.items" :key="item.name">
              {{ item.name }} [{{ item.amount }}]
            </li>
          </ul>
        </div>
        <span class="text-2xl font-bold text-yellow-600"
          >{{ order.totalAmount }}$</span
        >
        <div class="flex items-center gap-4 border-t border-gray-200 pt-3">
          <button
            class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out text-sm hover:cursor-pointer"
            @click="resolveOrder(order.orderId)"
          >
            RESOLVE ORDER
          </button>
          <button
            class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out text-sm hover:cursor-pointer"
            @click="deleteOrder(order.orderId)"
          >
            DELETE ORDER
          </button>
        </div>

        <div v-if="order.shippingDetails" class="border-t border-gray-200 pt-3">
          <p class="text-gray-700 font-semibold mb-2">Shipping Details:</p>
          <div
            class="text-gray-600 text-sm grid grid-cols-1 md:grid-cols-2 gap-1"
          >
            <span
              ><strong>Name:</strong> {{ order.shippingDetails.firstName }}
              {{ order.shippingDetails.lastName }}</span
            >
            <span
              ><strong>Phone:</strong> ({{
                order.shippingDetails.phoneNumber
              }})</span
            >
            <span
              ><strong>Email:</strong> {{ order.shippingDetails.email }}</span
            >
            <span
              ><strong>Address:</strong> {{ order.shippingDetails.address }},
              {{ order.shippingDetails.city }}</span
            >
            <span
              ><strong>Postal Code:</strong>
              {{ order.shippingDetails.postalCode }}</span
            >
            <span
              ><strong>Country:</strong>
              {{ order.shippingDetails.country }}</span
            >
          </div>
          <p
            v-if="order.shippingDetails.notes"
            class="text-gray-500 italic mt-2"
          >
            <strong>Notes:</strong> {{ order.shippingDetails.notes }}
          </p>
        </div>
      </div>
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
