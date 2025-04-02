import { defineStore } from "pinia";

export const useCart = defineStore("cart", {
  state: () => {
    return { cart: [] };
  },
  actions: {
    addItem(object) {
      const existingItem = this.cart.find((x) => x.name === object.name);

      if (existingItem) {
        console.log(`Item ${object.name} already in the cart.`);
      } else {
        this.cart.push(object);
        console.log(`Item added:`, this.cart[0]);
      }
    },
    getCart() {
      return this.cart;
    },
  },
});
