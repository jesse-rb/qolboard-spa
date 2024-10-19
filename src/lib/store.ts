import { writable, type Writable } from "svelte/store";

export type AppStore = {
    registeredEmail: string|null
    isAuthenticated: boolean
    email: string
    headerHeight: number
    controlPanelWidth: number
}

export const appStore:Writable<AppStore> = writable({
    registeredEmail: null,
    isAuthenticated: true,
    email: "",
    headerHeight: 0,
    controlPanelWidth: 0
});
