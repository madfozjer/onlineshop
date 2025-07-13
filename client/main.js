import { createApp } from "vue";
import App from "./src/App.vue";
import router from "@/router/router";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { createPinia } from "pinia";
import { useCart } from "@/stores/cart";
import { useCollections } from "@/stores/colections";

const pinia = createPinia();
const app = createApp(App);

pinia.use(piniaPluginPersistedstate);
app.use(pinia);
app.use(router);
app.mount("#app");
const cart = useCart();
cart.loadFromStorage();
