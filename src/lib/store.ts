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
