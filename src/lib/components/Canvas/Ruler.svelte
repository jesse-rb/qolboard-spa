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

    $: scaledWidth = $canvasStore.width / $canvasStore.zoom;
    
    $: toX = ($canvasStore.width + adderPanX)+roundToInt(100/$canvasStore.zoom, 100);
    $: fromX = (0 + adderPanX)-roundToInt(100/$canvasStore.zoom, 100);

    $: rangeX = range(toX, fromX, stepX, false);

    // Update our ruler to/form range when panning the canvas
    $: if (((-1) * $canvasStore.xPan+$canvasStore.zoomDx) > (adderPanX + stepX)) {
        adderPanX = (adderPanX + stepX);
    }
    $: if (((-1) * ($canvasStore.xPan+$canvasStore.zoomDx)) < (adderPanX - stepX)) {
        adderPanX = (adderPanX - stepX);
    }

    $: console.log(rangeX);
</script>

<div class="x-ruler pointer-events-none {colorIsDark($canvasStore.backgroundColor) ? 'text-white' : 'text-black'}">
    {#each rangeX as i}
        {@const iOffsetForDisplay = i - $canvasStore.width/2}

        {@const display = roundToInt(iOffsetForDisplay, stepX) }
        {@const pos = ( (i + $canvasStore.xPan + $canvasStore.zoomDx) * $canvasStore.zoom ) }

        <span class="absolute font-mono" style="left: {pos}px;" >{display.toFixed(0)}</span>
        <span class="absolute font-mono" style="left: {pos}px; top: 2em" >i: ({Math.round(i)})</span>
        <span class="absolute font-mono" style="left: {pos}px; top: 3em" >pan({Math.round($canvasStore.xPan)})</span>
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

