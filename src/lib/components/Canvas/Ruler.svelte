<script lang="ts">
    import { colorIsDark, range, roundToTarget } from "../../util";
    import { getContext, onMount, tick } from "svelte";
    import type { CanvasStore } from "./types/canvas.js";
    import type { Writable } from "svelte/store";

    export let isHorizontal = true;

    const canvasStore:Writable<CanvasStore> = getContext('canvasStore');
    let rulerStep:number = 100;
    let rulerRange:Array<number> = [];

    // RangeX zoom point variables
    let nextRangeZoomIn = $canvasStore.zoom * 1.5;
    let nextRangeZoomOut = $canvasStore.zoom;
    
    $: length = isHorizontal ? $canvasStore.width : $canvasStore.height;
    $: pan = isHorizontal ? $canvasStore.xPan : $canvasStore.yPan;
    $: zoomDelta = isHorizontal ? $canvasStore.zoomDx : $canvasStore.zoomDy;

    // Update our ruler to/form range when panning the canvas
    $: if (((-1) * pan+zoomDelta+length) > (rulerRange[rulerRange.length-1] + rulerStep)) {
        const iEnd = rulerRange.length-1;
        const end = rulerRange[iEnd];
        rulerRange = [ ...rulerRange.slice(1), end + rulerStep ];
    }
    $: if (((-1) * (pan+zoomDelta)) < (rulerRange[0] - rulerStep)) {
        const start = rulerRange[0];
        rulerRange = [ start - rulerStep, ...rulerRange.slice(0, -1) ];
    }

    $: if ($canvasStore.zoom >= nextRangeZoomIn) {
        zoomInRange();
    }

    $: if ($canvasStore.zoom < nextRangeZoomOut) {
        zoomOutRange();
    }

    onMount(() => {
        rulerRange = range(length, 0, rulerStep);
    });

    function zoomInRange() {
        // Set the next range zoom stepping points
        nextRangeZoomOut = nextRangeZoomIn;
        nextRangeZoomIn = nextRangeZoomIn * 2;

        // Update range start/end
        const iEnd = rulerRange.length - 1;
        const end = rulerRange[iEnd]*0.5;
        const start = rulerRange[0]*0.5;

        const newStepX = rulerStep * 0.5;

        // Update stepX
        rulerStep = newStepX;

        // Update range
        rulerRange = range(end, start, rulerStep);
    }

    function zoomOutRange() {
        // Set the next range zoom stepping points
        nextRangeZoomIn = nextRangeZoomOut;
        nextRangeZoomOut = nextRangeZoomOut * 0.5;

        const newStepX = rulerStep * 2;
        
        // Update stepX
        rulerStep = newStepX;

        // Update range start/end
        const iEnd = rulerRange.length - 1;
        const end = roundToTarget(rulerRange[iEnd]*2, rulerStep);
        const start = roundToTarget(rulerRange[0]*2, rulerStep);

        // Update range
        rulerRange = range(end, start, rulerStep);
    }

</script>

<div class="{isHorizontal ? 'x' : 'y'} ruler pointer-events-none {colorIsDark($canvasStore.backgroundColor) ? 'text-white' : 'text-black'}">
    {#each rulerRange as i}
        {@const pos = ( (i + pan + zoomDelta) * $canvasStore.zoom )}
        <span class="opacity-50 absolute font-mono" style="{isHorizontal ? 'left' : 'top'}: {pos}px;" >{i}</span>
        <div class="opacity-10 grid absolute bg-gray-50 overflow-hidden pointer-events-none" style="{isHorizontal ? `left: ${pos}px` : `top: ${pos}px;`}" ></div>
    {/each}
</div>

<style>
    .ruler {
        font-size: small;
        position: fixed;
    }
    .x.ruler {
        left: 0;
        right: 0;
        top: var(--canvas-offset);
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
        top: var(--canvas-offset);
        bottom: 0;
        left: 0;
        right: 0;
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

