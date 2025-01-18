import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import Welcome from "../views/Welcome.vue";
import CreateProfile from "../views/CreateProfile.vue";
import DisplayProfiles from "@/views/SelectProfiles.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "welcome",
    component: Welcome,
  },
  {
    path: "/createProfile",
    name: "createProfile",
    component: CreateProfile
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: "/selectProfile",
    name: "selectProfile",
    component: DisplayProfiles,
  }
];

const router = createRouter({
  history: createWebHashHistory(), // Use hash mode for compatibility with Electron
  routes,
});

export default router;
