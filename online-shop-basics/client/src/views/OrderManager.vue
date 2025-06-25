<script setup>
import { useProductsList } from "@/stores/products";
import { ref } from "vue";

const products = useProductsList();

const loggedIn = ref(false);
console.log(localStorage.getItem("authToken"));
loggedIn.value = await products.auth();
console.log(loggedIn.value);
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
</script>

<template>
  <div v-if="loggedIn"></div>
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
