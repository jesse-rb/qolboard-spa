<script lang="ts">
    import { invertColor, range, roundToInt } from "../../util.js";
    import { getContext } from "svelte";
    import type { CanvasStore } from "./types/canvas.js";
    import type { Writable } from "svelte/store";
    const canvasStore:Writable<CanvasStore> = getContext('canvasStore');
    let stepX:number = 100;
    let scaledWidth:number = 0;
    let toX:number = 0;
    let fromX:number = 0;
    let rangeX:Array<number> = [];
    let adder:number = 0;

    $: scaledWidth = $canvasStore.width / $canvasStore.zoom;
    
    $: toX = (scaledWidth + adder);
    $: fromX = (0 + adder);

    $: rangeX = range(toX, fromX, stepX, false);

    // Update our ruler to/form range when panning the canvas
    $: if (((-1) * $canvasStore.xPan) > (adder + stepX)) {
        adder = (adder + stepX);
    }
    $: if (((-1) * $canvasStore.xPan) < (adder - stepX)) {
        adder = (adder - stepX);
    }

    // $: if ( (Math.round($canvasStore.zoom * 100) / 100) % 10 === 0 ) {
    //     stepX = $canvasStore.zoom * 100;
    // }

    // $: stepX = roundToInt($canvasStore.zoom / 100, 100);

    $: console.log(stepX);
</script>

<div class="x-ruler pointer-events-none" style="color: {invertColor($canvasStore.backgroundColor)};">
    {#each rangeX as i}
        {@const iOffsetForDisplay = i - (scaledWidth / 2)}

        {@const pos = ( (i) + ($canvasStore.xPan) )*$canvasStore.zoom}
        {@const display = roundToInt(iOffsetForDisplay, stepX)}

        <span style="position: absolute; left: {pos}px;" >{display}</span>
        <span style="position: absolute; left: {pos}px; top: 2em" >({Math.round(pos)})</span>
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

