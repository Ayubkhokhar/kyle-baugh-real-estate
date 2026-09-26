import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./style.css";

const app = createApp(App);
app.use(router);

// Ensure router has resolved initial location before mounting to prevent any flash of agent navigation
router.isReady().then(() => {
  app.mount("#app");
});
