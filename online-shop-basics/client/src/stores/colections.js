import { defineStore } from "pinia";

export const useCollections = defineStore("collections", {
  state: () => {
    return {
      collections: [
        { name: "Ready4Summer!☀️🕶️", items: ["pprD7", "no7OW"] },
        { name: "Going Retro👾", items: ["pprD7"], color: "" },
      ],
    };
  },
});
