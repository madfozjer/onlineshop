<script setup>
import randomColor from "randomcolor"; // For random colors in logging description, duh
import { defineEmits } from "vue";

const emit = defineEmits(["deleteproduct"]);

const props = defineProps({
  logDesc: Function, // Logging description
  item: Object, // Product data
});
</script>

<template>
  <div>
    <!-- If no image, put empty string in it -->
    <img
      :src="props.item.images ? `/assets/images/${item.images[0]}` : ``"
      width="150px"
      height="150px"
      class="rounded-sm mx-auto block border-2 shadow-sm border-gray-200 -mb-6"
    />
    <!-- Button to log description in console -->
    <button
      v-if="props.logDesc"
      class="hover:cursor-pointer"
      @click="logDesc(props.item.description, randomColor())"
    >
      DESC
    </button>
    <!-- Checking for logDesc because I pass it only when i need all this function like delete and logDesc -->
    <button
      v-if="props.logDesc"
      class="ml-4 hover:cursor-pointer"
      @click="$emit('deleteproduct', props.item.id)"
    >
      X
    </button>
    <!-- Delete product, but it works only if not in collection displayer -->
    <br />

    <span>{{ props.item.name }}</span>
    [<span class="underline">{{ props.item.id }}</span
    >]
    <!-- Displaying name and ID -->
  </div>
</template>
