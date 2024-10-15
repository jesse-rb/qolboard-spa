<script lang="ts">
    import CanvasListing from "$lib/components/Canvas/CanvasListing.svelte";
    import type { Canvas } from "$lib/components/Canvas/types/canvas";
    import type { IndexResponse } from "$lib/types";
    import { onMount } from "svelte";

    let loading = false;
    let canvases:Array<Canvas> = [];

    async function getCanvases():Promise<Array<Canvas>> {
        loading = true;

        let data:Array<Canvas> = [];

        const domain = import.meta.env.VITE_API_HOST;
        const path = `user/canvas`;
        const url = `${domain}/${path}`;

        const response = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: {
                "content-type": "application/json"
            }
        });

        if (response.ok) {
            const json:IndexResponse<Canvas> = await response.json();
            data = json.data;
        }

        loading = false;
        return data;
    }

    onMount(async () => {
        canvases = await getCanvases();
    });
</script>

<div>
    {#if loading}
        <p>loading</p>
    {:else if canvases.length > 0}
        {#each canvases as canvas, i}
            <div>
                <CanvasListing canvas={canvas} on:delete={() => canvases = [...canvases.slice(0, i), ...canvases.slice(i+1)]} />
            </div>
        {/each}
    {:else}
        <p>No canvases saved yet.</p>
    {/if}
</div>

<style>

</style>