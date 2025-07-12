import { createWebHistory, createRouter } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import ProductPage from "@/views/ProductPage.vue";
import Dashboard from "@/views/Dashboard.vue";
import Checkout from "@/views/Checkout.vue";
import SuccessPayment from "@/components/SuccessPayment.vue";
import OrderManager from "@/views/OrderManager.vue";

const routes = [
  { path: "/", component: HomeView, name: "Home" },
  { path: "/items/:id", component: ProductPage, name: "ProductPage" },
  { path: "/dashboard", component: Dashboard, name: "Dashboard" },
  { path: "/checkout", component: Checkout, name: "Checkout" },
  { path: "/success/:id", component: SuccessPayment, name: "Success" }, // :id code receives from url when opening SuccessPage
  { path: "/ordermanager", component: OrderManager, name: "OrderManager" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
}); // Creates Single-Page Application on HTML5

export default router;
