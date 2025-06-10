import { defineStore } from "pinia";
import axios from "axios";

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
          paramaters: ["M", "White", "T-Shirt"],
          tags: ["tshirt", "t-shirt", "vintage", "retro"],
          price: 40.0,
          images: ["autoboy-tee1.jpg"],
          description: `Channel retro vibes with the Autoboy Vintage T-Shirt, featuring a faded graphic inspired by classic 90s streetwear. Made from soft, breathable cotton with a relaxed fit, it’s perfect for casual days or layering up with your favorite jacket. A must-have for fans of nostalgic style and effortless cool.`,
        },
        {
          index: 1,
          id: "no7OW",
          name: "Disney Pizza Vintage T-Shirt",
          paramaters: ["S", "Red", "T-Shirt"],
          tags: ["tshirt", "t-shirt", "vintage", "retro", "cartoon"],
          price: 70.0,
          images: ["disney-pizza-tee1.jpg", "disney-pizza-tee-2.jpg"],
          description: `Bring the magic and the munchies together with the Disney Pizza Vintage T-Shirt. Featuring a retro-inspired graphic that blends beloved Disney charm with everyone's favorite food, this tee is made from ultra-soft cotton and designed for a relaxed, lived-in feel. Perfect for park days, pizza nights, or just repping your love for all things Disney.`,
        },
      ],
      tags: ["tshirt", "t-shirt", "vintage", "retro", "cartoon"],
      params: {
        colors: ["White", "Red", "Black"],
        types: ["T-Shirt", "Jacket"],
        sizes: ["S", "M"],
      },
      productNames: ["Autoboy Vintage T-Shirt", "Disney Pizza Vintage T-Shirt"],
    };
  },
  actions: {
    async resetStore() {
      this.list = [];
      this.deleteAPI("clearproducts");
      this.initStore();
    },
    initStore() {
      // some test data
      if (this.list[0] == undefined) {
        this.defaultList.forEach((element) => {
          this.list.push(element);
          this.postProduct(element);
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
    syncWithDB() {
      //get data from db. db state priority.
    },
    addItem(object) {
      this.list.push(object);
      object.tags.forEach((tag) => {
        this.tags.push(tag);
      });
      this.productNames.push(object.name);
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

      if (existingItem) return existingItem.id;
      else return "no item found";
    },
    async postProduct(body) {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/newproduct",
          {
            body,
          }
        );

        console.log(response.data);
        console.log(await this.getAPI("listproducts"));
      } catch (error) {
        console.error(
          "Error inserting document:",
          error.response ? error.response.data : error.message
        );
      }
    },
    async getAPI(call) {
      //listproducts
      try {
        const response = await fetch(`api/${call}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log(result);
        return result;
      } catch (error) {
        console.error(`Get call ${call} is unsuccesful.`, error);
        return null;
      }
    },
    async deleteAPI(call) {
      try {
        const response = await fetch(`http://localhost:5000/api/${call}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log(result.message);
        return result;
      } catch (error) {
        console.error(`Delete call ${call} is unsuccessful.`, error);
        return null;
      }
    },
  },
});
