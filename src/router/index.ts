import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Welcome from "@/views/Welcome.vue";
import CreateProfile from "@/views/profile/CreateProfile.vue";
import ProfileList from "@/views/profile/ProfileList.vue";
import EditProfile from "@/views/profile/EditProfile.vue";
import Portfolio from "@/views/portfolio/Portfolio.vue";
import AddCrypto from "@/views/crypto/AddCrypto.vue";
import ViewCrypto from "@/views/crypto/ViewCrypto.vue";
import RemoveCrypto from "@/views/crypto/RemoveCrypto.vue";
import ManageAssistantAllocations from "@/views/portfolio/ManageAssistantAllocations.vue";

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
    path: "/crypto/:profileId",
    name: "crypto",
    props: true, // Pass profileId as a prop to child routes
    children: [
      {
        path: "add",
        name: "addCrypto",
        component: AddCrypto,
        props: true
      },
      {
        path: "view/:cryptoId",
        name: "viewCrypto",
        component: ViewCrypto,
        props: true, // Pass assetId as a prop to the component
      },
      {
        path: "remove/:cryptoId",
        name: "removeCrypto",
        component: RemoveCrypto,
        props: true, // Pass assetId as a prop to the component
      },
    ],
  },
  {
    path: "/assistantAllocations/:profileId/:action", // `action` will be either "add" or "remove"
    name: "manageAssistantAllocations",
    component: ManageAssistantAllocations, // A single component for both actions
    props: true, // Pass `profileId` and `action` as props
  }
];

const router = createRouter({
  history: createWebHashHistory(), // Use hash mode for compatibility with Electron
  routes,
});

export default router;
