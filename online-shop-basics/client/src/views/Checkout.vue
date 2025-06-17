<script setup>
import CartProduct from "@/components/CartProduct.vue";
import Navigation from "@/components/Navigation.vue";
import PayPalButton from "@/components/PayPalButton.vue";
import router from "@/router/router";
import { useCart } from "@/stores/cart";
import { stringify } from "postcss";
import { ref, computed } from "vue";
const cart = useCart();
const itemNames = [];
cart.getCart().forEach((item) => {
  itemNames.push(item.name);
});

var paymentStatus, paymentStatusClass;

const deliveryMethods = ["Inpost", "Poczta Polska"];
const deliveryFees = {
  Inpost: 5,
  "Poczta Polska": 3,
};
const delivery = ref("");

const calculateTotal = computed(() => {
  if (delivery.value != "") {
    return cart.total + deliveryFees[delivery.value];
  } else {
    return cart.total;
  }
});

function handlePaymentSuccess(details) {
  paymentStatus = `Payment successful! Order ID: ${details.id}`;
  paymentStatusClass = "success";
  cart.clearCart();
  console.log(details.captureDetails.id);
  router.push(`/success/${details.captureDetails.id}`);
  // Here you would typically update your backend, fulfill the order, etc.
}

function handlePaymentError(error) {
  paymentStatus = "Payment failed. Please try again.";
  paymentStatusClass = "error";
}

function handlePaymentCancelled(data) {
  paymentStatus = "Payment cancelled by user.";
  paymentStatusClass = "cancelled";
}
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
        >TOTAL: <span class="font-normal">{{ calculateTotal }}$ </span></span
      >
      <p class="text-xl font-normal">
        Delivery fee: {{ deliveryFees[delivery]
        }}<span>{{ delivery != "" ? "$" : "" }}</span>
      </p>
      <PayPalButton
        v-if="delivery != ''"
        class="mt-4"
        :product-name="JSON.stringify(itemNames)"
        :product-price="parseFloat(calculateTotal)"
        :delivery-fee="deliveryFees[delivery]"
        @payment-success="handlePaymentSuccess"
        @payment-error="handlePaymentError"
        @payment-cancelled="handlePaymentCancelled"
      />
    </div>
  </div>
</template>
