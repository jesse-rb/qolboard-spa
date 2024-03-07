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

    $: scaleOffsetX = ($canvasStore.width / $canvasStore.zoom)/2;
    
    $: toX = ($canvasStore.width + adderPanX);
    $: fromX = (0 + adderPanX);

    $: rangeX = range(toX, fromX, stepX, false);
    $: console.log(rangeX);

    // Update our ruler to/form range when panning the canvas
    $: if (((-1) * $canvasStore.xPan+$canvasStore.zoomDx) > (adderPanX + stepX)) {
        adderPanX = (adderPanX + stepX);
    }
    $: if (((-1) * ($canvasStore.xPan+$canvasStore.zoomDx)) < (adderPanX - stepX)) {
        adderPanX = (adderPanX - stepX);
    }

    $: if (rangeX.length % 2 === 0) {
        rangeX.unshift(rangeX[0]-stepX);
    }

    // IF zoom has increased by >= .5 of zoom
    //  THEN range start/end needs .25 of range trimmed off either end
    //  AND stepX needs to decrease by .5*stepX
    // IF zoom has decreased by >= 0.1
    //  THEN range start/end needs .5 of range added to either end
    //  AND stepX needs to be extended by 2*stepX

    let nextRangeZoomIn = $canvasStore.zoom * 1.5;
    let nextRangeZoomOut = $canvasStore.zoom;

    $: if ($canvasStore.zoom >= nextRangeZoomIn) {
        zoomInRange();
    }

    $: if ($canvasStore.zoom < nextRangeZoomOut) {
        zoomOutRange();
    }

    function zoomInRange() {
        // Set the next range zoom stepping points
        nextRangeZoomOut = nextRangeZoomIn;
        nextRangeZoomIn = nextRangeZoomIn * 1.5;
        
        // Trim range
        const trimAmount = Math.floor(rangeX.length/4)*stepX;
        
        fromX += trimAmount;
        toX -= trimAmount;

        // Update stepX
        stepX *= 0.5;

        console.log('HIT ZOOM IN POINT: ↓↓↓');
        console.log('nextRangeZoomIn: ↓');
        console.log(nextRangeZoomIn);
        console.log('nextRangeZoomOut: ↓');
        console.log(nextRangeZoomOut);
        console.log('trimAmount: ↓');
        console.log(trimAmount);
        console.log('stepX: ↓');
        console.log(stepX);
        console.log('rangeX: ↓');
        console.log(rangeX);
    }

    function zoomOutRange() {
        // Set the next range zoom stepping points
        nextRangeZoomIn = nextRangeZoomOut;
        nextRangeZoomOut = nextRangeZoomOut * 0.5;
        
        // Extend range
        const extendAmount = Math.ceil(rangeX.length/4)*stepX;

        fromX -= extendAmount;
        toX += extendAmount;

        // Update stepX
        stepX *= 2;

        console.log('HIT ZOOM OUT POINT: ↓↓↓');
        console.log('nextRangeZoomIn: ↓');
        console.log(nextRangeZoomIn);
        console.log('nextRangeZoomOut: ↓');
        console.log(nextRangeZoomOut);
        console.log('extendAmount: ↓');
        console.log(extendAmount);
        console.log('stepX: ↓');
        console.log(stepX);
        console.log('rangeX: ↓');
        console.log(rangeX);
    }

</script>

<div class="x-ruler pointer-events-none {colorIsDark($canvasStore.backgroundColor) ? 'text-white' : 'text-black'}">
    {#each rangeX as i}
        {@const iOffsetForDisplay = i - $canvasStore.width/2}

        {@const display = roundToInt(iOffsetForDisplay, stepX) }
        {@const pos = ( (i + $canvasStore.xPan + $canvasStore.zoomDx) * $canvasStore.zoom ) }

        <span class="absolute font-mono" style="left: {pos}px;" >{display.toFixed(0)}</span>
        <span class="absolute font-mono" style="left: {pos}px; top: 2em" >i: ({Math.round(i)})</span>
        <!-- <span class="absolute font-mono" style="left: {pos}px; top: 3em" >pan({Math.round($canvasStore.xPan)})</span> -->
        <span class="absolute font-mono" style="left: {pos}px; top: 4em" >pos: ({Math.round(pos)})</span>
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

