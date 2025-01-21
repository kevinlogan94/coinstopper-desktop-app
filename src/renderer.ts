/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './styles/index.scss';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import PrimeVue from "primevue/config";
import 'primevue/resources/themes/arya-blue/theme.css'; // Theme
import "primevue/resources/primevue.min.css"; // PrimeVue core styles
import "primeicons/primeicons.css"; // PrimeIcons
import "primeflex/primeflex.css"; // PrimeFlex (optional)
import Tooltip from 'primevue/tooltip';


const app = createApp(App)
app.directive('tooltip', Tooltip)
app.use(router)
app.use(PrimeVue);
app.mount('#app');
