import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Welcome from "@/views/Welcome.vue";
import CreateProfile from "@/views/profile/CreateProfile.vue";
import ProfileList from "@/views/profile/ProfileList.vue";
import EditProfile from "@/views/profile/EditProfile.vue";
import Portfolio from "@/views/portfolio/Portfolio.vue";
import AddAsset from "@/views/asset/AddAsset.vue";
import ViewAsset from "@/views/asset/ViewAsset.vue";
import RemoveAsset from "@/views/asset/RemoveAsset.vue";
import ManageFund from "@/views/portfolio/ManageFund.vue";

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
  },
  {
    path: "/asset/:profileId",
    name: "asset",
    props: true, // Pass profileId as a prop to child routes
    children: [
      {
        path: "add",
        name: "addAsset",
        component: AddAsset,
        props: true
      },
      {
        path: "asset/view/:assetId",
        name: "viewAsset",
        component: ViewAsset,
        props: true, // Pass assetId as a prop to the component
      },
      {
        path: "remove/:assetId",
        name: "removeAsset",
        component: RemoveAsset,
        props: true, // Pass assetId as a prop to the component
      },
    ],
  },
  {
    path: "/fund/:profileId/:action", // `action` will be either "add" or "remove"
    name: "manageFund",
    component: ManageFund, // A single component for both actions
    props: true, // Pass `profileId` and `action` as props
  }
];

const router = createRouter({
  history: createWebHashHistory(), // Use hash mode for compatibility with Electron
  routes,
});

export default router;
