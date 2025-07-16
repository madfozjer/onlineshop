import { defineStore } from "pinia";
import { useProductsList } from "./products";

export const useCollections = defineStore("collections", {
  state: () => {
    return {
      collections: [],
      products: useProductsList(),
    };
  },
  actions: {
    async initStore() {
      try {
        const fetchedData = await this.products.listCollections(); // Receiving data as document from inner API
        this.collections = [];

        if (fetchedData) {
          fetchedData.forEach((item) => {
            // Code receives data as document and need to parse this array and push all data to inner store
            this.collections.push(item.body);
          });
        } else throw new Error("No data received from API");
      } catch (error) {
        console.error("Error initializing collections store:", error);
        alert("Error initializing collections store");
      }
    },
    addCollection(name, items) {
      if (!this.products.postCollection({ name: name, items: items })) {
        return false;
      } else {
        this.collections.push({ name: name, items: items });
        return true;
      }
    },
    deleteCollection(name) {
      if (this.collections.find((collection) => collection.name === name)) {
        if (this.products.deleteCollection(name)) {
          alert(`Collection ${name} was deleted succesfully`);
          this.collections = this.collections.filter(
            (obj) => obj.name !== name
          ); // This code deletes collection
        }
      } else {
        alert("Collection was not found");
        return false;
      }
    },
  },
});
