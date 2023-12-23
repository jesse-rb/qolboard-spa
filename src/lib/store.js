import { writable } from "svelte/store";

export const store = writable({
    loggedIn: false,
    user: null
});
