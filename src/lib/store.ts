import { writable, type Writable } from "svelte/store";
import type { TypeUser } from "./types/user";

export type AppStore = {
    registeredEmail: string | null
    isAuthenticated: boolean
    user: TypeUser
    headerHeight: number
    controlPanelWidth: number
}

export const appStore: Writable<AppStore> = writable({
    registeredEmail: null,
    isAuthenticated: true,
    user: {
        email: "",
        uuid: "",
    },
    headerHeight: 0,
    controlPanelWidth: 0
});

export async function getUser() {
    const domain = import.meta.env.VITE_API_HOST;
    const path = "user";
    const url = `${domain}/${path}`;

    const response = await fetch(url, {
        method: "GET",
        credentials: "include",
    });

    if (response.ok) {
        const responseBody = await response.json();
        appStore.update((store) => {
            store.isAuthenticated = true;
            store.user = responseBody.data;

            return store;
        });
    }
    else {
        appStore.update((store) => {
            store.isAuthenticated = false;
            store.user.email = "";
            store.user.uuid = "";

            return store;
        });
    }
}
