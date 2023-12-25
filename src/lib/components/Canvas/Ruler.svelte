<script lang="ts">
    import { range, roundToInt } from "../../util.js";
    import { getContext } from "svelte";
    import type { CanvasStore } from "./types/canvas.js";
    import type { Writable } from "svelte/store";
    const canvasStore:Writable<CanvasStore> = getContext('canvasStore');
    const stepX:number = 100;
    let scaledWidth:number = 0;
    let toX:number = 0;
    let fromX:number = 0;
    let rangeX:Array<number> = [];
    let adder:number = 0;

    $: toX = ($canvasStore.width + adder);
    $: fromX = (0 + adder);

    $: rangeX = range(toX, fromX, stepX / 10 + 1, true);

    $: if (((-1) * $canvasStore.xPan)/$canvasStore.zoom > (adder + stepX)/$canvasStore.zoom) {
        adder += stepX;
    }
    $: if (((-1) * $canvasStore.xPan)/$canvasStore.zoom < (adder - stepX)/$canvasStore.zoom) {
        adder -= stepX;
    }
</script>

<div class="x-ruler">
    {#each rangeX as i}
        {@const iOffsetForDisplay = i - $canvasStore.width / 2}

        {@const pos = ( (i) + ($canvasStore.xPan*$canvasStore.zoom) )}
        {@const display = Math.round(roundToInt(iOffsetForDisplay, stepX)/$canvasStore.zoom)}

        <span style="position: absolute; left: {pos}px;" >{display}</span>
        <span style="position: absolute; left: {pos}px; top: 2em" >({Math.round(pos)})</span>
    {/each}
</div>

<style>
    .x-ruler {
        width: 100%;
        height: 0.1em;
        background-color: var(--color-fore);
        font-size: small;
        position: relative;
        margin-top: 0.5em;
        overflow-x: clip;
        opacity: 0.5;
    }
    .x-ruler span {
        top: 0.5em;
    }
</style>

