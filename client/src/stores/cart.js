import { defineStore } from "pinia";

export const useCart = defineStore("cart", {
  state: () => {
    return { cart: [], total: 0 };
  },
  actions: {
    addItem(object) {
      const existingItem = this.cart.find((x) => x.name === object.name);

      if (existingItem) {
        existingItem["amount"]++;
      } else {
        object["amount"] = 1;
        this.cart.push(object);
      } // If item exists, it just adds +1 to amount. When not, adds item to cart as new.

      this.total += object.price;

      this.saveToStorage();
      this.recalcTotal();
    },
    getCart() {
      return this.cart;
    },
    getTotal() {
      return this.total;
    },
    deleteItem(object) {
      const existingItem = this.cart.find((x) => x.name === object.name);

      if (existingItem) {
        if (existingItem.amount > 1) {
          existingItem.amount--;
          this.total -= object.price;
          this.saveToStorage();
        } else if (existingItem.amount == 1) {
          this.cart = this.cart.filter((product) => {
            return product.name != object.name;
          });

          this.total -= object.price;
          this.saveToStorage();
          this.recalcTotal();
        }
      }
    },
    clearCart() {
      this.cart = [];
      this.total = 0;
      this.saveToStorage();
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

      // If data exists ( if not it's bad but we can live with that, so no error ), loads it from localStorage
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
      localStorage.setItem("cartData", JSON.stringify({ cartData: this.cart })); // localStorage accepts only strings, so we stringify all data
      localStorage.setItem(
        "totalData",
        JSON.stringify({ totalData: this.total })
      ); // totalData = sum-total of all prices data
    },
    recalcTotal() {
      this.total = 0;
      this.cart.forEach((element) => {
        this.total += element.price * element.amount;
      });
    },
  },
});
