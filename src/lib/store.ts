import { writable, type Writable } from "svelte/store";

export type AppStore = {
    isAuthenticated: boolean
    email: string
    headerHeight: number
    controlPanelHeight: number
    page: string
}

export const appStore:Writable<AppStore> = writable({
    isAuthenticated: false,
    email: "",
    headerHeight: 0,
    controlPanelHeight: 0,
    page: "/"
});

export function redirect(path) {
    path="/"
}
