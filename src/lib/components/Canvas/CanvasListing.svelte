<script lang="ts">
    import Button from "../Button.svelte";
    import type { Canvas } from "./types/canvas";

    export let canvas:Canvas

    let deleteIsLoading = false;

    async function deleteCanvas() {
        deleteIsLoading = true;

        const id = canvas.id;
        const resp = await fetch(`/canvas/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const body = await resp.json();

        deleteIsLoading = false;
    }
</script>

<a href="/canvas/{canvas.id}">Canvas {canvas.id}</a> <Button icon="delete" onclick={deleteCanvas} isLoading={deleteIsLoading}/>