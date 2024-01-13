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
    
    $: toX = ($canvasStore.width + adderPanX);
    $: fromX = (0 + adderPanX);

    // $: stepX = 100 + adderZoom;

    $: rangeX = range(toX, fromX, stepX, false);

    // Update our ruler to/form range when panning the canvas
    $: if (((-1) * $canvasStore.xPan) > (adderPanX + stepX)) {
        adderPanX = (adderPanX + stepX);
    }
    $: if (((-1) * $canvasStore.xPan) < (adderPanX - stepX)) {
        adderPanX = (adderPanX - stepX);
    }

    $: if ($canvasStore.zoom > 1) {
        if ($canvasStore.zoom*100 > stepX) {
            // stepX = stepX / 2;
            
        }
        if ($canvasStore.zoom*100 < stepX) {
            // stepX = stepX * 2;
        }
    }
    // $: if ($canvasStore.zoom < 1) {
    //     if ($canvasStore.zoom*100 > stepX) {
    //         stepX = 100;
    //     }
    //     if ($canvasStore.zoom*100 < stepX) {
    //         stepX -= 100;
    //     }
    // }

    $: console.log($canvasStore.zoom*10);
    $: console.log(stepX);
</script>


<div class="x-ruler pointer-events-none {colorIsDark($canvasStore.backgroundColor) ? 'text-white' : 'text-black'}">
    {#each rangeX as i}
        {@const iOffsetForDisplay = i - (toX - fromX)/2}

        {@const pos = ( (i) + ($canvasStore.xPan) ) * $canvasStore.zoom}
        {@const display = roundToInt(iOffsetForDisplay, stepX)}

        <span class="absolute font-mono" style="left: {pos}px;" >{display.toFixed(0)}</span>
        <span class="absolute font-mono" style="left: {pos}px; top: 2em" >({Math.round(pos)})</span>
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

