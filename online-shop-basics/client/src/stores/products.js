import { defineStore } from "pinia";
import axios from "axios";

export const useProductsList = defineStore("products", {
  persist: true,
  state: () => {
    return {
      list: [],
      tags: [],
      params: {
        colors: [],
        types: [],
        sizes: [],
      },
      productNames: [],
      token: "",
    };
  },
  actions: {
    initStore() {
      console.log(this.params);
    },
    async resetStore() {
      this.list = [];
      this.deleteAPI("clearproducts");
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
      this.analyzeParams();
      return `Item ${object.name} has been added`;
    },
    analyzeParams() {
      this.params = {
        colors: [],
        types: [],
        sizes: [],
      };

      this.list.forEach((item) => {
        this.params.colors.push(item.paramaters[0]);
        this.params.sizes.push(item.paramaters[1]);
        this.params.types.push(item.paramaters[2]);
      });
    },
    getLength() {
      return this.list.length;
    },
    getList() {
      return this.list;
    },
    async deleteItem(id) {
      const existingItem = this.list.find((x) => x.id == id);

      if (!existingItem) {
        return `Can't find your item`;
      }

      try {
        const response = await fetch("/api/deleteproduct", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: existingItem.id }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Server responded with status ${response.status}`
          );
        }

        const data = await response.json();

        this.list = this.list.filter(
          (product) => product.id != existingItem.id
        );
        this.analyzeParams();

        return true;
      } catch (error) {
        return false;
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
      } catch (error) {
        console.error(
          "Error inserting document:",
          error.response ? error.response.data : error.message
        );
      }
    },
    async login(input) {
      try {
        const response = await axios.post("http://localhost:5000/api/login", {
          password: input,
        });

        console.log(response.data);
        localStorage.setItem("authToken", response.data.authToken);
        return response.status;
      } catch (error) {
        console.error("Error hashing password:", error.message);
        return 401;
      }
    },
    async auth() {
      try {
        const response = await axios.get("http://localhost:5000/api/auth", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        if (response.status == 200) return true;
        else return false;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
    async getAPI(call) {
      //listproducts, getpaypalclientid
      try {
        const response = await fetch(`http://localhost:5000/api/${call}`, {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        return result;
      } catch (error) {
        console.error(`Get call ${call} is unsuccesful.`, error);
        return null;
      }
    },
    /*async deleteAPI(call) {
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
    },*/
    async postShippingData(body) {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/shipping",
          {
            body,
            contentType: "application/json",
          }
        );

        console.log(response.data);
        return response.data;
      } catch (error) {
        console.error(
          "Error posting shipping data:",
          error.response ? error.response.data : error.message
        );
        return null;
      }
    },
    async resolveOrder(id) {
      // Assuming this is part of an async function
      console.log(`Resolving order ${id}..`);
      try {
        const response = await fetch(
          `http://localhost:5000/api/resolveorder/${id}`
        );

        if (response.status === 200) {
          console.log(`Order resolved successfully ${id}`);
          // If your server sends back data on success, you might want to parse it
          // const data = await response.json(); // Or response.text()
          return true; // Or return data; if you want to return the parsed data
        } else {
          console.log(
            `Error resolving order ${id}. Status: ${response.status}`
          );
          // If your server sends an error message in the response body, parse it
          const errorData = await response.json().catch(() => response.text()); // Try JSON, then plain text
          console.error("Server error details:", errorData);
          return errorData; // Return the error details from the server
        }
      } catch (error) {
        console.error(
          `Network or unexpected error resolving order ${id}:`,
          error
        );
        return false; // Indicate failure due to an exception
      }
    },
    async deleteOrder(id) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/deleteorder/${id}`
        );

        if (response.status === 200) {
          console.log(`Order deleted successfully ${id}`);
          return true;
        } else {
          console.log(`Error deleting order ${id}. Status: ${response.status}`);
        }
      } catch (error) {
        console.error(
          `Network or unexpected error deleting order ${id}:`,
          error
        );
        return false; // Indicate failure due to an exception
      }
    },
  },
});
