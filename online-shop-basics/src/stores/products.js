import { defineStore } from "pinia";

export const useProductsList = defineStore("products", {
  persist: true,
  state: () => {
    return {
      list: [],
      defaultList: [
        {
          index: 0,
          id: "pprD7",
          name: "Autoboy Vintage T-Shirt",
          paramaters: ["M", "Good"],
          tags: ["tshirt", "t-shirt", "vintage", "retro"],
          price: 40.0,
          images: ["autoboy-tee1.jpg"],
          description: `Channel retro vibes with the Autoboy Vintage T-Shirt, featuring a faded graphic inspired by classic 90s streetwear. Made from soft, breathable cotton with a relaxed fit, it’s perfect for casual days or layering up with your favorite jacket. A must-have for fans of nostalgic style and effortless cool.`,
        },
        {
          index: 1,
          id: "no7OW",
          name: "Disney Pizza Vintage T-Shirt",
          paramaters: ["S", "New"],
          tags: ["tshirt", "t-shirt", "vintage", "retro", "cartoon"],
          price: 70.0,
          images: ["disney-pizza-tee1.jpg", "disney-pizza-tee-2.jpg"],
          description: `Bring the magic and the munchies together with the Disney Pizza Vintage T-Shirt. Featuring a retro-inspired graphic that blends beloved Disney charm with everyone's favorite food, this tee is made from ultra-soft cotton and designed for a relaxed, lived-in feel. Perfect for park days, pizza nights, or just repping your love for all things Disney.`,
        },
      ],
    };
  },
  actions: {
    resetStore() {
      this.list = [];
      this.initStore();
    },
    initStore() {
      // some test data
      if (this.list[0] == undefined) {
        this.defaultList.forEach((element) => {
          this.list.push(element);
        });
      }
    },
    getItem(id) {
      const existingItem = this.list.find((x) => x.id == id);

      if (existingItem) {
        return existingItem;
      } else {
        return 404;
      }
    },
    addItem(object) {
      this.list.push(object);
      return `Item ${object.name} has been added`;
    },
    getLength() {
      return this.list.length;
    },
    getList() {
      return this.list;
    },
    deleteItem(id) {
      const existingItem = this.list.find((x) => x.id == id);

      if (existingItem) {
        this.list = this.list.filter((product) => {
          return product.id != existingItem.id;
        });
        return `Item ${existingItem.name} was deleted from products list`;
      } else {
        return `Can't find your item`;
      }
    },
    getId(name) {
      const existingItem = this.list.find((x) => x.name === name);

      if (existingItem) return existingItem.description;
    },
  },
});
