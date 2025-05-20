import { defineStore } from "pinia";

export const useCart = defineStore("cart", {
  state: () => {
    return { cart: [], total: 0 };
  },
  actions: {
    addItem(object) {
      const existingItem = this.cart.find((x) => x.name === object.name);
      if (existingItem) {
        object["amount"]++;
      } else {
        object["amount"] = 1;
        this.cart.push(object);
      }

      this.total += object.price;
      console.log(`Item added:`, object);

      this.saveToStorage();
      this.recalcTotal();
    },
    deleteItem(object) {
      const existingItem = this.cart.find((x) => x.name === object.name);

      if (existingItem && existingItem.amount > 1) {
        existingItem.amount--;
        this.total -= object.price;
        console.log(`Item ${object.name} was deleted`);
        this.saveToStorage();
      } else if (existingItem && existingItem.amount == 1) {
        this.cart = this.cart.filter((product) => {
          return product.name != object.name;
        });

        this.total -= object.price;
        console.log(`Item ${object.name} was deleted`);
        this.saveToStorage();
        this.recalcTotal();
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
    loadFromStorage() {
      const cartData = localStorage.getItem("cartData");
      const totalData = localStorage.getItem("totalData");
      if (cartData) {
        this.cart = JSON.parse(cartData).cartData;
      }
      if (totalData) {
        this.total = parseInt(JSON.parse(totalData).totalData);
      }

      if (this.total <= 0 || isNaN(this.total)) {
        this.total = 0;
      }
    },
    saveToStorage() {
      localStorage.setItem("cartData", JSON.stringify({ cartData: this.cart }));
      localStorage.setItem(
        "totalData",
        JSON.stringify({ totalData: this.total })
      );
    },
    recalcTotal() {
      this.total = 0;
      this.cart.forEach((element) => {
        this.total += element.price * element.amount;
      });
    },
  },
});
