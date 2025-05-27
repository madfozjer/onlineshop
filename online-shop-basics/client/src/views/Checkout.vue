<script setup>
import CartProduct from "@/components/CartProduct.vue";
import Navigation from "@/components/Navigation.vue";
import { useCart } from "@/stores/cart";
import { ref, computed } from "vue";
const cart = useCart();

const deliveryMethods = ["Inpost", "Poczta Polska"];
const deliveryFees = {
  Inpost: 5,
  "Poczta Polska": 3,
};
const delivery = ref("");

const calculateTotal = computed(() => {
  if (delivery.value != "")
    return cart.total + deliveryFees[delivery.value] + "$";
  else return cart.total + "$";
});
</script>

<template>
  <Navigation></Navigation>
  <div class="justify-center flex h-screen">
    <div class="flex flex-col gap-4 mt-12">
      <CartProduct
        v-for="item in cart.cart"
        :product="item"
        class="border rounded-md w-lg"
      />
      <div>
        <label for="myDropdown" class="pr-1 text-2xl font-semibold"
          >Select an option:</label
        >
        <select id="myDropdown" v-model="delivery">
          <option disabled value="">Please select one</option>
          <option v-for="option in deliveryMethods" class="text-lg">
            {{ option }}
          </option>
        </select>
        <p class="text-xl font-thin">Your delivery method: {{ delivery }}</p>
      </div>

      <span class="text-2xl font-semibold mt-52"
        >TOTAL: <span class="font-normal">{{ calculateTotal }} </span></span
      >
      <p class="text-xl font-normal">
        Delivery fee: {{ deliveryFees[delivery]
        }}<span>{{ delivery != "" ? "$" : "" }}</span>
      </p>
      <div
        class="text-md border-2 block w-auto max-w-24 border-purple-800 bg-gradient-to-l from-purple-200/70 to-purple-300/70 rounded-md font-bold text-purple-900 p-1 hover:cursor-pointer hover:from-purple-300/70 hover:to-purple-500/70 hover:bg-gradient-to-b"
      >
        CHECKOUT
      </div>
    </div>
  </div>
</template>
