<script lang="ts">
    import type { Writable } from "svelte/store";
    import type { Canvas } from "./types/canvas";
    import { getContext } from "svelte";

    interface Props {
        cursors?: Record<string, { x: number; y: number }>;
    }

    let { cursors = {} }: Props = $props();

    const canvasStore: Writable<Canvas> = getContext("canvasStore");

    const offset = 0;

    let canvasZoom = $derived($canvasStore.canvas_data.zoom);

    let canvasWidth = $derived($canvasStore.canvas_data.width ?? 0);
    let canvasHeight = $derived($canvasStore.canvas_data.height ?? 0);

    let canvasWidthScaled = $derived(canvasWidth * canvasZoom);
    let canvasHeightScaled = $derived(canvasHeight * canvasZoom);

    let canvasPanX = $derived($canvasStore.canvas_data.xPan);
    let canvasPanY = $derived($canvasStore.canvas_data.yPan);

    let zoomClientOffsetX = $derived((canvasWidth - canvasWidthScaled) / 2);
    let zoomClientOffsetY = $derived((canvasHeight - canvasHeightScaled) / 2);
</script>

{#each Object.entries(cursors) as [email, pos]}
    <!--some QUICK MATHS-->
    {@const x =
        pos.x * canvasZoom +
        zoomClientOffsetX +
        canvasPanX * canvasZoom +
        offset}
    {@const y =
        pos.y * canvasZoom +
        zoomClientOffsetY +
        canvasPanY * canvasZoom +
        offset}
    <div
        class="pointer-events-none fixed"
        style="left: {x}px; top: calc({y}px + var(--header-height));"
    >
        <span class="material-icons">mouse</span>
        <span class="text-xs">{email}</span>
    </div>
{/each}
