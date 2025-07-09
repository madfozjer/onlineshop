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
      const fetchedData = await this.products.listCollections();
      this.collections = [];

      fetchedData.forEach((item) => {
        this.collections.push(item.body);
      });
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
          );
        }
      } else {
        alert("Collection was not found");
        return false;
      }
    },
  },
});
