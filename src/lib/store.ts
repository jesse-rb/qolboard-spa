import { writable, type Writable } from "svelte/store";

export type AppStore = {
    registeredEmail: string|null
    isAuthenticated: boolean
    email: string
    headerHeight: number
    controlPanelHeight: number
}

export const appStore:Writable<AppStore> = writable({
    registeredEmail: null,
    isAuthenticated: false,
    email: "",
    headerHeight: 0,
    controlPanelHeight: 0
});
