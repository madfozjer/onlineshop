import { createApp } from "vue";
import App from "./src/App.vue";
import router from "@/router/router";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { createPinia } from "pinia";
import { useProductsList } from "@/stores/products";
import { useCart } from "@/stores/cart";

const pinia = createPinia();
const app = createApp(App);

pinia.use(piniaPluginPersistedstate);
app.use(pinia);
app.use(router);
app.mount("#app");
const products = useProductsList();
products.initStore();
const cart = useCart();
cart.loadFromStorage();

/*
try {
  const response = await axios.post("http://localhost:5000/api/newproduct", {
    name: "Vintage Autoboy T-Shirt",
    price: 40.0,
  });

  console.log("Document inserted:", response.data);
} catch (error) {
  console.error(
    "Error inserting document:",
    error.response ? error.response.data : error.message
  );
}*/
