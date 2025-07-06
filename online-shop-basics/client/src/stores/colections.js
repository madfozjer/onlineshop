import { defineStore } from "pinia";

export const useCollections = defineStore("collections", {
  state: () => {
    return {
      collections: [],
    };
  },
  actions: {
    addCollection(name, items) {
      this.collections.push({ name: name, items: items });
    },
    deleteCollection(name) {
      if (this.collections.find((collection) => collection.name === name)) {
        alert(`Collection ${name} was deleted succesfully`);
        this.collections = this.collections.filter((obj) => obj.name !== name);
      } else {
        alert("Collection was not found");
        return false;
      }
    },
  },
});
