<script setup>
import { ref } from "vue";
import { useCart } from "@/stores/cart";
import router from "@/router/router";

const cart = useCart();

const props = defineProps({
  product: Object,
});

if (props.product.images != undefined) {
  props.product.image = props.product.images[0];
}

const canDelete = ref(false);
</script>

<template>
  <div
    class="flex gap-2 hover:bg-gray-100"
    @mouseover="canDelete = true"
    @mouseleave="canDelete = false"
  >
    <img
      :src="`/assets/images/${props.product.image}`"
      width="48px"
      height="48px"
      class="rounded-sm hover:cursor-pointer"
      @click="router.push(`/items/${props.product.id}`)"
    />
    <span
      class="text-2xl self-center min-w-0 max-w-xs flex-shrink whitespace-nowrap overflow-hidden"
      >{{ props.product.name }}</span
    >
    <span
      class="text-md self-center min-w-0 max-w-xs flex-shrink whitespace-nowrap overflow-hidden bg-gray-300/40 p-0.5 px-1.5 border-2 border-dotted"
    >
      <button
        class="hover:cursor-pointer"
        @click="cart.deleteItem(props.product)"
      >
        -
      </button>
      {{ props.product.amount }}
      <button class="hover:cursor-pointer" @click="cart.addItem(props.product)">
        +
      </button>
    </span>

    <span class="text-xl self-center text-purple-900 underline"
      >{{ props.product.price }}$</span
    >
    <button
      v-if="canDelete"
      @click="cart.deleteItem(props.product)"
      class="hover:cursor-pointer"
    >
      x
    </button>
  </div>
</template>
