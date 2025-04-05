import { createWebHistory, createRouter } from "vue-router";
import HomeView from "../views/HomeView.vue";
import ProductPage from "@/views/ProductPage.vue";
import Product from "@/components/Product.vue";
import Dashboard from "@/views/Dashboard.vue";

const routes = [
  { path: "/", component: HomeView, name: "Home" },
  { path: "/items/:id", component: ProductPage },
  { path: "/dashboard", component: Dashboard, name: "Dashboard" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
