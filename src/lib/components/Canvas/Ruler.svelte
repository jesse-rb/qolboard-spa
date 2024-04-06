<script lang="ts">
    import { colorIsDark, range, roundToTarget } from "../../util";
    import { getContext, onMount } from "svelte";
    import type { CanvasStore } from "./types/canvas.js";
    import type { Writable } from "svelte/store";

    export let isHorizontal = true;

    const canvasStore:Writable<CanvasStore> = getContext('canvasStore');
    let stepX:number = 100;
    let rangeX:Array<number> = [];

    // RangeX zoom point variables
    let nextRangeZoomIn = $canvasStore.zoom * 1.5;
    let nextRangeZoomOut = $canvasStore.zoom;
    
    $: length = isHorizontal ? $canvasStore.width : $canvasStore.height;
    $: pan = isHorizontal ? $canvasStore.xPan : $canvasStore.yPan;
    $: zoomDelta = isHorizontal ? $canvasStore.zoomDx : $canvasStore.zoomDy;

    // Update our ruler to/form range when panning the canvas
    $: if (((-1) * pan+zoomDelta+length) > (rangeX[rangeX.length-1] + stepX)) {
        // adderPanX = (adderPanX + stepX);
        const iEnd = rangeX.length-1;
        const end = rangeX[iEnd];
        rangeX = [ ...rangeX.slice(1), end + stepX ];
    }
    $: if (((-1) * (pan+zoomDelta)) < (rangeX[0] - stepX)) {
        // adderPanX = (adderPanX - stepX);
        const start = rangeX[0];
        rangeX = [ start - stepX, ...rangeX.slice(0, -1) ];
    }

    $: if ($canvasStore.zoom >= nextRangeZoomIn) {
        zoomInRange();
    }

    $: if ($canvasStore.zoom < nextRangeZoomOut) {
        zoomOutRange();
    }

    onMount(() => {
        rangeX = range(length, 0, stepX);
    });

    function zoomInRange() {
        // Set the next range zoom stepping points
        nextRangeZoomOut = nextRangeZoomIn;
        nextRangeZoomIn = nextRangeZoomIn * 2;

        // Update range start/end
        const iEnd = rangeX.length - 1;
        const end = rangeX[iEnd]*0.5;
        const start = rangeX[0]*0.5;

        const newStepX = stepX * 0.5;

        // Update stepX
        stepX = newStepX;

        // Update range
        rangeX = range(end, start, stepX);
        console.log(rangeX);
    }

    function zoomOutRange() {
        // Set the next range zoom stepping points
        nextRangeZoomIn = nextRangeZoomOut;
        nextRangeZoomOut = nextRangeZoomOut * 0.5;

        const newStepX = stepX * 2;
        
        // Update stepX
        stepX = newStepX;

        // Update range start/end
        const iEnd = rangeX.length - 1;
        const end = roundToTarget(rangeX[iEnd]*2, stepX);
        const start = roundToTarget(rangeX[0]*2, stepX);

        // Update range
        rangeX = range(end, start, stepX);
        console.log(rangeX);
    }

</script>

<div class="{isHorizontal ? 'x' : 'y'} ruler pointer-events-none {colorIsDark($canvasStore.backgroundColor) ? 'text-white' : 'text-black'}">
    {#each rangeX as i}
        {@const pos = ( (i + pan + zoomDelta) * $canvasStore.zoom ) }
        <span class="absolute font-mono" style="{isHorizontal ? 'left' : 'top'}: {pos}px;" >{i}</span>
    {/each}
</div>

<style>
    .ruler {
        font-size: small;
        position: absolute;
    }
    .x.ruler {
        left: 0;
        right: 0;
        width: 100%;
        height: 1em;
        margin-top: 0.5em;
        overflow-x: clip;
    }
    .x.ruler span {
        top: 0.5em;
    }
    .y.ruler {
        top: var(--canvas-offset);
        bottom: 0;
        width: 1em;
        margin-left: 0.5em;
        overflow-y: clip;
    }
    .y.ruler span {
        left: 0.5em;
    }
</style>

