import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createAuth0 } from "@auth0/auth0-vue";
import "./index.css";

createApp(App)
    .use(router)
    .use(
        createAuth0({
            domain: import.meta.env.VITE_AUTH0_DOMAIN as string,
            client_id: import.meta.env.VITE_AUTH0_CLIENT_ID as string,
            cacheLocation: "localstorage",
            redirect_uri: window.location.origin + "/login",
            legacySameSiteCookie: false,
        }),
    )
    .mount("#app");
