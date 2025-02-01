<script lang="ts">
    import { colorIsDark, range, roundToTarget } from "../../util";
    import { getContext, onMount } from "svelte";
    import type { Writable } from "svelte/store";
    import type { Canvas } from "./types/canvas";

    export let isHorizontal = true;

    const canvasStore: Writable<Canvas> = getContext("canvasStore");
    let rulerStep: number = 100;
    let rulerRange: Array<number> = [];

    // RangeX zoom point variables
    let nextRangeZoomIn = $canvasStore.canvasData.zoom * 1.5;
    let nextRangeZoomOut = $canvasStore.canvasData.zoom;

    $: length =
        (isHorizontal
            ? $canvasStore.canvasData.width
            : $canvasStore.canvasData.height) ?? 0;
    $: pan = isHorizontal
        ? $canvasStore.canvasData.xPan
        : $canvasStore.canvasData.yPan;
    $: zoomDelta = isHorizontal
        ? $canvasStore.canvasData.zoomDx
        : $canvasStore.canvasData.zoomDy;

    // Update our ruler to/form range when panning the canvas
    $: if (
        -1 * pan + zoomDelta + length >
        rulerRange[rulerRange.length - 1] + rulerStep
    ) {
        panRightRange();
    }
    $: if (-1 * (pan + zoomDelta) < rulerRange[0] - rulerStep) {
        panLeftRange();
    }

    $: if ($canvasStore.canvasData.zoom >= nextRangeZoomIn) {
        zoomInRange();
    }

    $: if ($canvasStore.canvasData.zoom < nextRangeZoomOut) {
        zoomOutRange();
    }

    $: if (length) {
        // Update range start/end
        const end = roundToTarget(-1 * pan + zoomDelta + length, rulerStep);
        const start = roundToTarget(-1 * (pan + zoomDelta), rulerStep);

        // Update range
        rulerRange = range(end, start, rulerStep);
        // rulerRange = range(length, 0, rulerStep);
    }

    onMount(() => {
        // Update range start/end
        const end = roundToTarget(-1 * pan + zoomDelta + length, rulerStep);
        const start = roundToTarget(-1 * (pan + zoomDelta), rulerStep);

        // Update range
        rulerRange = range(end, start, rulerStep);
        // rulerRange = range(length, 0, rulerStep);
        console.log(rulerRange);
    });

    function panLeftRange() {
        const start = rulerRange[0];
        rulerRange = [start - rulerStep, ...rulerRange.slice(0, -1)];
    }

    function panRightRange() {
        const iEnd = rulerRange.length - 1;
        const end = rulerRange[iEnd];
        rulerRange = [...rulerRange.slice(1), end + rulerStep];
    }

    function zoomInRange() {
        // Set the next range zoom stepping points
        nextRangeZoomOut = nextRangeZoomIn;
        nextRangeZoomIn = nextRangeZoomIn * 2;

        const offset = (rulerRange.length / 2 / 2) * rulerStep;
        console.log(offset);

        const newStepX = rulerStep * 0.5;

        // Update stepX
        rulerStep = newStepX;

        // Update range start/end
        const end = roundToTarget(-1 * pan + zoomDelta + length, rulerStep);
        const start = roundToTarget(-1 * (pan + zoomDelta), rulerStep);

        // Update range
        rulerRange = range(end, start, rulerStep);

        console.log(rulerRange);
    }

    function zoomOutRange() {
        // Set the next range zoom stepping points
        nextRangeZoomIn = nextRangeZoomOut;
        nextRangeZoomOut = nextRangeZoomOut * 0.5;

        const newStepX = rulerStep * 2;

        // Update stepX
        rulerStep = newStepX;

        // Update range start/end
        const end =
            roundToTarget(-1 * pan + zoomDelta + length, rulerStep) +
            roundToTarget(rulerStep * rulerRange.length * 0.25, rulerStep);
        const start =
            roundToTarget(-1 * (pan + zoomDelta), rulerStep) -
            roundToTarget(rulerStep * rulerRange.length * 0.25, rulerStep);

        // Update range
        rulerRange = range(end, start, rulerStep);

        console.log(rulerRange);
    }
</script>

<div
    class="{isHorizontal ? 'x' : 'y'} ruler pointer-events-none {colorIsDark(
        $canvasStore.canvasData.backgroundColor,
    )
        ? 'text-white'
        : 'text-black'}"
>
    {#each rulerRange as i}
        {@const pos = (i + pan + zoomDelta) * $canvasStore.canvasData.zoom}
        {#if $canvasStore.canvasData.rulerSettings.showUnits}
            <span
                class="opacity-50 absolute font-mono"
                style="{isHorizontal ? 'left' : 'top'}: {pos}px;">{i}</span
            >
        {/if}
        {#if $canvasStore.canvasData.rulerSettings.showLines}
            <div
                class="opacity-10 grid absolute bg-gray-50 overflow-hidden pointer-events-none"
                style={isHorizontal ? `left: ${pos}px` : `top: ${pos}px;`}
            ></div>
        {/if}
    {/each}
</div>

<style>
    .ruler {
        font-size: small;
        position: fixed;
    }
    .x.ruler {
        right: var(--canvas-offset-right);
        top: var(--canvas-offset-top);
        left: 0;
        bottom: 0;
        margin-top: 0.5em;
        overflow-x: clip;
    }
    .x.ruler span {
        top: 0.5em;
    }
    .x.ruler .grid {
        top: 0;
        bottom: 0;
        width: 1px;
    }
    .y.ruler {
        top: var(--canvas-offset-top);
        left: 0;
        bottom: 0;
        right: var(--canvas-offset-right);
        margin-left: 0.5em;
        overflow-y: clip;
    }
    .y.ruler span {
        left: 0.5em;
    }
    .y.ruler .grid {
        left: 0;
        right: 0;
        height: 1px;
    }
</style>
