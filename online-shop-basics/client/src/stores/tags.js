import { defineStore } from "pinia";

export const useTags = defineStore("tags", {
  state: () => ({
    list: [],
  }),
  actions: {
    addTag(tag) {
      this.list.push(tag);
      return `${tag} was succesfully added`;
    },
    deleteTag(toDelete) {
      if (this.list.find((tag) => tag === toDelete)) {
        this.list = this.list.filter((tag) => tag !== toDelete);
        return `${toDelete} was succesfully deleted`;
      } else {
        return `${toDelete} was not found`;
      }
    },
  },
});
