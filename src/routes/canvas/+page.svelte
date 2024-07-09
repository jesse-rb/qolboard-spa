<script lang="ts">
    import Canvas from "$lib/components/Canvas/Canvas.svelte";
    import type { CanvasSerialized } from "$lib/components/Canvas/types/canvas";

    let loading = false;

    async function getCanvases():Promise<Array<Canvas>> {
        loading = true;

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
            const canvases = await response.json();
            return canvases;
        }

        loading = false;

        return [];
    }
</script>

<div>
    {#await getCanvases()}
        <p>loading</p>
    {:then canvases}
        {#if canvases.length > 0}
            {#each canvases as canvas}
                <div>
                    <a href="/canvas/{canvas.id}">Canvas {canvas.id}</a>
                </div>
            {/each}
        {:else}
            <p>No canvases saved yet.</p>
        {/if}
    {/await}
</div>

<style>

</style>