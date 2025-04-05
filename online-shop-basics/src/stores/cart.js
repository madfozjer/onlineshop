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
        console.log(`Item added:`, object);
      }
    },
    deleteItem(object) {
      const existingItem = this.cart.find((x) => x.name === object.name);

      if (existingItem) {
        this.cart = this.cart.filter((product) => {
          return product.name != object.name;
        });

        console.log(`Item ${object.name} was deleted`);
      } else {
        console.log(`Item is not there`);
      }
    },
    getCart() {
      return this.cart;
    },
    getItem(id) {
      const existingItem = this.list.find((x) => x.id == id);

      if (existingItem) {
        return existingItem;
      } else {
        return 404;
      }
    },
  },
});
