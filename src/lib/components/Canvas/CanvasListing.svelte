<script lang="ts">
    import Button from "../Button.svelte";
    import Canvas from "./Canvas.svelte";
    import type { Canvas as TypeCanvas } from "../Canvas/types/canvas";
    import { appStore } from "$lib/store";
    import { request } from "$lib/http";

    interface Props {
        canvas: TypeCanvas;
        dispatchDeleted: Function;
    }

    let { canvas, dispatchDeleted }: Props = $props();

    let name = $derived(canvas.canvas_data.name ?? "Give this canvas a name");

    let deleteIsLoading = $state(false);

    async function deleteCanvas() {
        deleteIsLoading = true;

        const id = canvas.id;

        const path = `user/canvas/${id}`;

        const resp = await request("DELETE", path);
        await resp.json();

        deleteIsLoading = false;

        dispatchDeleted();
    }
</script>

<div title={name} class="flex flex-col gap-2 bg-back-2 p-4 rounded-md w-56">
    <a class="no-underline" href="/canvas/{canvas.id}">
        <Canvas id={canvas.id} preview canvasData={canvas} />
    </a>
    <div class="flex gap-2 justify-between items-end">
        <div class="overflow-hidden">
            <p class="text-xs">({canvas.id})</p>
            <p
                class="font-bold whitespace-nowrap overflow-hidden text-ellipsis w-full"
            >
                {name}
            </p>
        </div>
        {#if canvas.user_id === $appStore.user.id}
            <Button
                icon="clear"
                onclick={deleteCanvas}
                isLoading={deleteIsLoading}
            />
        {/if}
    </div>
</div>
