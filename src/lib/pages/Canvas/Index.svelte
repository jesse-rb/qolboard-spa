<script lang="ts">
    let loading = false;

    let canvases = getCanvases();

    async function getCanvases():Promise<Array<object>> {
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
        ...loading
    {:then canvases} 
        {#each canvases as canvas}
            <div>
                <a href="/canvas/{canvas.ID}">Canvas {canvas.ID}</a>
            </div>
        {/each}
    {/await}
</div>

<style>

</style>