import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Welcome from "@/views/Welcome.vue";
import CreateProfile from "@/views/profile/CreateProfile.vue";
import ProfileList from "@/views/profile/ProfileList.vue";
import EditProfile from "@/views/profile/EditProfile.vue";
import Portfolio from "@/views/Portfolio.vue";
import AddAsset from "@/views/asset/AddAsset.vue";
import ViewAsset from "@/views/asset/ViewAsset.vue";
import RemoveAsset from "@/views/asset/RemoveAsset.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "welcome",
    component: Welcome,
  },
  {
    path: "/profile",
    name: "profile",
    children: [
      {
        path: "list",
        name: "profileList",
        component: ProfileList,
      },
      {
        path: "create",
        name: "createProfile",
        component: CreateProfile,
      },
      {
        path: "edit/:profileId",
        name: "editProfile",
        component: EditProfile,
        props: true, // Pass profileId as a prop to the component
      },
    ],
  },
  {
    path: "/portfolio/:profileId",
    name: "portfolio",
    component: Portfolio,
    props: true, // Enable props to pass profileId to the component
    children: [
      {
        path: "asset/add",
        name: "addAsset",
        component: AddAsset,
      },
      {
        path: "asset/view/:assetId",
        name: "viewAsset",
        component: ViewAsset,
        props: true, // Pass assetId as a prop to the component
      },
      {
        path: "asset/remove/:assetId",
        name: "removeAsset",
        component: RemoveAsset,
        props: true, // Pass assetId as a prop to the component
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(), // Use hash mode for compatibility with Electron
  routes,
});

export default router;
