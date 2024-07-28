import { writable, type Writable } from "svelte/store";

export type AppStore = {
    isAuthenticated: boolean
    email: string
    headerHeight: number
    controlPanelHeight: number
}

export const appStore:Writable<AppStore> = writable({
    isAuthenticated: true,
    email: "",
    headerHeight: 0,
    controlPanelHeight: 0
});
