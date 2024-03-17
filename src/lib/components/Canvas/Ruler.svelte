<script lang="ts">
    import { colorIsDark, range, roundToInt } from "../../util";
    import { getContext } from "svelte";
    import type { CanvasStore } from "./types/canvas.js";
    import type { Writable } from "svelte/store";

    const canvasStore:Writable<CanvasStore> = getContext('canvasStore');
    let stepX:number = 100;
    let toX:number = $canvasStore.width;
    let fromX:number = 0;
    let rangeX:Array<number> = [];
    let adderPanX:number = 0;

    // RangeX zoom point variables
    let nextRangeZoomIn = $canvasStore.zoom * 1.5;
    let nextRangeZoomOut = $canvasStore.zoom;
    let adderZoomX = 0;
    
    $: if ($canvasStore.width || adderPanX || adderZoomX) {
        toX = ($canvasStore.width + adderPanX - adderZoomX);
        fromX = (0 + adderPanX + adderZoomX);
    }

    $: rangeX = range(toX, fromX, stepX, false);
    $: console.log(rangeX);

    // Update our ruler to/form range when panning the canvas
    $: if (((-1) * $canvasStore.xPan+$canvasStore.zoomDx) > ((adderPanX-adderZoomX) + stepX)) {
        adderPanX = (adderPanX + stepX);
    }
    $: if (((-1) * ($canvasStore.xPan+$canvasStore.zoomDx)) < ((adderPanX+adderZoomX) - stepX)) {
        adderPanX = (adderPanX - stepX);
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
        stepX = stepX;
    }

    // $: console.log(`fromX: ${fromX}`);
    // $: console.log(`toX: ${toX}`);
    // $: console.log(rangeX);

    // function zoomInRange() {
    //     // Set the next range zoom stepping points
    //     nextRangeZoomOut = nextRangeZoomIn;
    //     nextRangeZoomIn = nextRangeZoomIn * 1.5;
        
    //     // Trim range
    //     adderZoomX += Math.floor(rangeX.length/4)*stepX;
        
    //     // Update stepX
    //     stepX *= 0.5;
    // }

    function zoomOutRange() {
        // Set the next range zoom stepping points
        nextRangeZoomIn = nextRangeZoomOut;
        nextRangeZoomOut = nextRangeZoomOut * 0.5;

        const newStepX = stepX * 2;
        
        // Extend range
        adderZoomX -= stepX;
        
        // Update stepX
        stepX = newStepX;
    }

</script>

<div class="x-ruler pointer-events-none {colorIsDark($canvasStore.backgroundColor) ? 'text-white' : 'text-black'}">
    {#each rangeX as i}
        {@const iOffsetForDisplay = i - $canvasStore.width/2}

        {@const display = roundToInt(iOffsetForDisplay, stepX) }
        {@const pos = ( (i + $canvasStore.xPan + $canvasStore.zoomDx) * $canvasStore.zoom ) }

        <span class="absolute font-mono" style="left: {pos}px;" >{display.toFixed(0)}</span>
        <span class="absolute font-mono" style="left: {pos}px; top: 2em" >i: ({Math.round(i)})</span>
        <span class="absolute font-mono" style="left: {pos}px; top: 4em" >i: ({Math.round(iOffsetForDisplay)})</span>
        <!-- <span class="absolute font-mono" style="left: {pos}px; top: 4em" >pos: ({Math.round(pos)})</span> -->
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

