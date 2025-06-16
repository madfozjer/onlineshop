import { createWebHistory, createRouter } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import ProductPage from "@/views/ProductPage.vue";
import Dashboard from "@/views/Dashboard.vue";
import Checkout from "@/views/Checkout.vue";
import SuccessPayment from "@/components/SuccessPayment.vue";

const routes = [
  { path: "/", component: HomeView, name: "Home" },
  { path: "/items/:id", component: ProductPage },
  { path: "/dashboard", component: Dashboard, name: "Dashboard" },
  { path: "/checkout", component: Checkout },
  { path: "/success", component: SuccessPayment, name: "Success" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
