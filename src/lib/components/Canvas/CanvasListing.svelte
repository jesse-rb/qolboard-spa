<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Button from "../Button.svelte";
    import type { Canvas } from "./types/canvas";

    export let canvas:Canvas

    const dispatch = createEventDispatcher();
    let deleteIsLoading = false;

    function dispatchDeleted() {
        dispatch("delete");
    }

    async function deleteCanvas() {
        deleteIsLoading = true;

        const id = canvas.id;

        const domain = import.meta.env.VITE_API_HOST;
        const path = `user/canvas`;
        const url = `${domain}/${path}/${id}`;

        const resp = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });
        const json = await resp.json();

        deleteIsLoading = false;

        dispatchDeleted();
    }
</script>

<a href="/canvas/{canvas.id}">Canvas {canvas.id}</a> <Button icon="delete" onclick={deleteCanvas} isLoading={deleteIsLoading}/>