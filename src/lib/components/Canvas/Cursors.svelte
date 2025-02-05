<script lang="ts">
    import type { Writable } from "svelte/store";
    import type { Canvas } from "./types/canvas";
    import { getContext } from "svelte";

    export let cursors: Record<string, { x: number; y: number }> = {};

    const canvasStore: Writable<Canvas> = getContext("canvasStore");

    const offset = 0;

    $: canvasZoom = $canvasStore.canvasData.zoom;

    $: canvasWidth = $canvasStore.canvasData.width ?? 0;
    $: canvasHeight = $canvasStore.canvasData.height ?? 0;

    $: canvasWidthScaled = canvasWidth * canvasZoom;
    $: canvasHeightScaled = canvasHeight * canvasZoom;

    $: canvasPanX = $canvasStore.canvasData.xPan;
    $: canvasPanY = $canvasStore.canvasData.yPan;

    $: zoomClientOffsetX = (canvasWidth - canvasWidthScaled) / 2;
    $: zoomClientOffsetY = (canvasHeight - canvasHeightScaled) / 2;
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
        <span>zoomDx: {$canvasStore.canvasData.zoomDx}</span>
    </div>
{/each}
