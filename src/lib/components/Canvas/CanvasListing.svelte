<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Button from "../Button.svelte";
    import Canvas from "./Canvas.svelte";
    import type {Canvas as TypeCanvas} from "../Canvas/types/canvas"

    export let canvas:TypeCanvas

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

<div class="flex flex-col gap-2 bg-back_2 p-4 rounded-md">
    <a class="no-underline" href="/canvas/{canvas.id}">
        <Canvas id={canvas.id} preview />
    </a>
    <div class="flex gap-2 justify-between items-end">
        <div>
            <p class="text-xs">({canvas.id})</p>
            <p class="font-bold">{canvas.canvasData.name ?? "Give this canvas a name"}</p>
        </div>
        <Button icon="clear" onclick={deleteCanvas} isLoading={deleteIsLoading}/>
    </div>
</div>
