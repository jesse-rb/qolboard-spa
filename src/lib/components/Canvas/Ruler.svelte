<script lang="ts">
    import { colorIsDark, range } from "../../util";
    import { getContext, onMount } from "svelte";
    import type { CanvasStore } from "./types/canvas.js";
    import type { Writable } from "svelte/store";

    const canvasStore:Writable<CanvasStore> = getContext('canvasStore');
    let stepX:number = 100;
    // let toX:number = $canvasStore.width;
    // let fromX:number = 0;
    let rangeX:Array<number> = [];
    let adderPanX:number = 0;

    // RangeX zoom point variables
    let nextRangeZoomIn = $canvasStore.zoom * 1.5;
    let nextRangeZoomOut = $canvasStore.zoom;
    let adderZoomX = 0;
    
    $: width = $canvasStore.width;
    
    // $: if ($canvasStore.width || adderPanX || adderZoomX) {
    //     toX = ($canvasStore.width + adderPanX - adderZoomX);
    //     fromX = (0 + adderPanX + adderZoomX);
    // }

    // let ZERO = 0;
    // $: if (toX, fromX, stepX) {
    //     rangeX = range(toX, fromX, stepX);
    //     console.log(rangeX);

    //     if (!ZERO) {
    //         const i = Math.floor(rangeX.length/2);
    //         ZERO = rangeX[i];
    //     }
    // }

    // Update our ruler to/form range when panning the canvas
    $: if (((-1) * $canvasStore.xPan+$canvasStore.zoomDx+$canvasStore.width) > (rangeX[rangeX.length-1] + stepX)) {
        // adderPanX = (adderPanX + stepX);
        const iEnd = rangeX.length-1;
        const end = rangeX[iEnd];
        rangeX = [ ...rangeX.slice(1), end + stepX ];
    }
    $: if (((-1) * ($canvasStore.xPan+$canvasStore.zoomDx)) < (rangeX[0] - stepX)) {
        // adderPanX = (adderPanX - stepX);
        const start = rangeX[0];
        rangeX = [ start - stepX, ...rangeX.slice(0, -1) ];
    }

    // IF zoom has increased by >= .5 of zoom
    //  THEN range start/end needs .25 of range trimmed off either end
    //  AND stepX needs to decrease by .5*stepX
    // IF zoom has decreased by >= 0.1
    //  THEN range start/end needs .5 of range added to either end
    //  AND stepX needs to be extended by 2*stepX

    $: if ($canvasStore.zoom >= nextRangeZoomIn) {
        zoomInRange();
    }

    $: if ($canvasStore.zoom < nextRangeZoomOut) {
        zoomOutRange();
    }

    onMount(() => {
        rangeX = range(width, 0, stepX);
    });

    function zoomInRange() {
        // Set the next range zoom stepping points
        nextRangeZoomOut = nextRangeZoomIn;
        nextRangeZoomIn = nextRangeZoomIn * 1.5;

        const newStepX = stepX * 0.5;
        
        // Update stepX
        stepX = newStepX;

        // Update range start/end
        const iEnd = rangeX.length - 1;
        const end = rangeX[iEnd] - stepX*4;
        const start = rangeX[0] + stepX*4;

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
        const end = rangeX[iEnd] + stepX*4;
        const start = rangeX[0] - stepX*4;

        // Update range
        rangeX = range(end, start, stepX);
        console.log(rangeX);
    }

</script>

<div class="x-ruler pointer-events-none {colorIsDark($canvasStore.backgroundColor) ? 'text-white' : 'text-black'}">
    {#each rangeX as i}
        {@const pos = ( (i + $canvasStore.xPan + $canvasStore.zoomDx) * $canvasStore.zoom ) }

        <span class="absolute font-mono" style="left: {pos}px;" >{i.toFixed(0)}</span>
    {/each}
</div>

<style>
    .x-ruler {
        width: 100%;
        height: 0.1em;
        font-size: small;
        position: relative;
        margin-top: 0.5em;
        overflow-x: clip;
    }
    .x-ruler span {
        top: 0.5em;
    }
</style>

