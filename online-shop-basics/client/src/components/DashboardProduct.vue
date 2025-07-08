<script setup>
import randomColor from "randomcolor";
import { defineEmits } from "vue";

const emit = defineEmits(["deleteproduct"]);

const props = defineProps({
  logDesc: Function,
  item: Object,
});

//console.log(props.item);
</script>

<template>
  <img
    :src="props.item.images ? `/assets/images/${item.images[0]}` : ``"
    width="150px"
    height="150px"
    class="rounded-sm mx-auto block border-2 shadow-sm border-gray-200"
  />
  <button
    class="hover:cursor-pointer"
    @click="logDesc(props.item.description, randomColor())"
  >
    DESC</button
  ><button
    class="ml-4 hover:cursor-pointer"
    @click="$emit('deleteproduct', props.item.id)"
  >
    X</button
  ><br />

  <span>{{ props.item.name }}</span>
  [<span class="underline">{{ props.item.id }}</span
  >]
</template>
