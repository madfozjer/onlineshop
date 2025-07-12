import { defineStore } from "pinia";
import { useCollections } from "./colections";
import axios from "axios"; // Code uses this sometimes ( for post, delete etc. ) to talk to server

// STORE FOR PRODUCT AND DATABASE MANAGING
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
      collections: useCollections(),
    };
  },
  actions: {
    async initStore() {
      try {
        const response = await fetch("http://localhost:5000/api/listproducts"); // Receiving data from inner API database
        const data = await response.json();

        this.list = [];

        const fetchedData = data.documents; // Receiving data as document from inner API

        fetchedData.forEach((item) => {
          this.list.push(item.body);
        }); // Code receives data as document and need to parse this array and push all data to inner store

        this.analyzeParams(); // Going through data and putting data to params ( parameters )
        this.initTags();
      } catch (error) {}
    },
    async initTags() {
      try {
        const response = await fetch("http://localhost:5000/api/listtags"); // Receiving data from inner API database, but this data now is search tags under user's search bar
        const data = await response.json();

        this.tags = [];

        const fetchedData = data.documents;

        fetchedData.forEach((item) => {
          // Code receives data as document and need to parse this array and push all data to inner store
          this.tags.push(item.value);
        });
      } catch (error) {}
    },
    async resetStore() {
      this.list = [];
      this.tags = [];
      this.collections.collections = [];
      localStorage.clear();
      this.deleteAPI("clear");
      // Resets store locally, clears localStorage and calls innerAPI to using standard HTTP DELETE code to clear database
    },
    async listCollections() {
      try {
        const response = await fetch(
          "http://localhost:5000/api/listcollections"
        ); // Getting data from inner API to get collection data. It is function because we need to quickly update it when modifying collections.
        const data = await response.json();
        return data.documents;
      } catch (error) {}
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
      object.tags.forEach((tag) => {
        this.tags.push(tag);
      }); // Going through all tags of object and then pushing it to store's tags array
      this.productNames.push(object.name);
      this.analyzeParams();
      return `Item ${object.name} has been added`;
    },
    addTag(tag) {
      if (this.postTag(tag)) {
        this.tags.push(tag);
        return `${tag} was succesfully added`;
      } else return `Error occured during addition of ${tag}`;
    },
    deleteTag(toDelete) {
      if (this.tags.find((tag) => tag === toDelete)) {
        if (this.removeTagFromDB(toDelete)) {
          this.list = this.list.filter((tag) => tag !== toDelete);
          return `${toDelete} was succesfully deleted`;
        } else return `${toDelete} was not found`;
      }
    },
    async removeTagFromDB(tag) {
      try {
        const response = await axios.post("/api/deletetag", {
          tag: tag,
        });

        if (!response.ok) {
          return false;
        } else if (response.ok) {
          return true;
        }
      } catch (error) {
        return false;
      }
    },
    async postCollection(body) {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/newcollection",
          {
            body, // Body has all data about collection, receivs as param when adding collection
          }
        );

        if (response.ok) return true;
        else return false;
      } catch (error) {
        return false;
      }
    },
    analyzeParams() {
      this.params = {
        colors: [],
        types: [],
        sizes: [],
      }; // Clears parametrs

      this.list.forEach((item) => {
        // Item parameters must be sorted as COLOR/SIZE/TYPE or data will be mismatched
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
          body: JSON.stringify({ id: existingItem.id }), // Body sends JSON ( can send just body ) of body of id
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Server responded with status ${response.status}`
          );
        }

        this.list = this.list.filter(
          (product) => product.id != existingItem.id
        ); // Delets item by id

        this.analyzeParams();
        this.initStore(); // Re-initializes store to protect server-user sync

        return true;
      } catch (error) {
        return false;
      }
    },
    async deleteCollection(name) {
      try {
        const response = await axios.post("/api/deletecollection", {
          name: name,
        }); // Delets collection by name, not id

        if (!response.ok) {
          return false;
        } else if (response.ok) {
          return true;
        }
      } catch (error) {
        return false;
      }
    },
    getId(name) {
      const existingItem = this.list.find((x) => x.name === name);

      if (existingItem) return existingItem.id;
      else return "No item found";
    },
    async postTag(tag) {
      try {
        const response = await axios.post("http://localhost:5000/api/newtag", {
          tag: tag,
        });

        if (response.status == 200) return true;
        else false;
      } catch (error) {}
    },
    async postProduct(body) {
      try {
        await axios.post("http://localhost:5000/api/newproduct", {
          body,
        });
      } catch (error) {}
    },
    async login(input) {
      try {
        const response = await axios.post("http://localhost:5000/api/login", {
          password: input,
        }); // Login when on login page, password is configured on server .env file

        localStorage.setItem("authToken", response.data.authToken); // Receiving authToken and putting it in localStorage to stay logged in dashboard
        return response.status;
      } catch (error) {
        return 401;
      }
    },
    async auth() {
      try {
        const response = await axios.get("http://localhost:5000/api/auth", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }); // Check with custom header if user authenticated or not

        if (response.status == 200) return true;
        else return false;
      } catch (error) {
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
        return result;
      } catch (error) {
        return null;
      }
    },
    async postShippingData(body) {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/shipping",
          {
            body,
            contentType: "application/json",
          } // contentType is mostly for type-safety on server
        );

        return response.data;
      } catch (error) {
        return null;
      }
    },
    async resolveOrder(id) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/resolveorder/${id}`
        );

        if (response.status === 200) {
          return true;
        } else {
          // If server sends an error message in the response body, parse it
          const errorData = await response.json().catch(() => response.text());
          return errorData;
        }
      } catch (error) {
        return false; // Indicate failure due to an exception
      }
    },
    async deleteOrder(id) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/deleteorder/${id}`
        );

        if (response.status === 200) {
          return true;
        }
      } catch (error) {
        return false; // Indicate failure due to an exception
      }
    },
  },
});
