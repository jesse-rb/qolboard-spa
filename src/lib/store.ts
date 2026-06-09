import { writable, type Writable } from "svelte/store";
import type { TypeUser } from "./types/user";
import { request } from "./http";

export type AppStore = {
    registeredEmail: string | null
    checkedIsAuthenticated: boolean
    isAuthenticated: boolean
    user: TypeUser
    headerHeight: number
    controlPanelWidth: number
}

export const appStore: Writable<AppStore> = writable({
    registeredEmail: null,
    checkedIsAuthenticated: false,
    isAuthenticated: false,
    user: {
        email: "",
        id: "",
    },
    headerHeight: 0,
    controlPanelWidth: 0,
});

export async function getUser() {
    const path = "user";

    let ok: boolean = false;
    try {
        const response = await request("GET", path);

        if (response.ok) {
            ok = true

            const responseBody = await response.json();
            appStore.update((store) => {
                store.checkedIsAuthenticated = true;
                store.isAuthenticated = true;
                store.user = responseBody.data;

                return store;
            });
        }
    }
    catch {
        ok = false
    }

    if (!ok) {
        appStore.update((store) => {
            store.checkedIsAuthenticated = true;
            store.isAuthenticated = false;
            store.user.email = "";
            store.user.id = "";

            return store;
        });
    }
}
