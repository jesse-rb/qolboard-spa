<script>
    import { range, roundToInt } from "../../util.js";
    import { getContext } from "svelte";
    const canvasStore = getContext('canvasStore');
    $: stepX = 100;
    $: toFromOffset = $canvasStore.xPan;
    $: scaledWidth = $canvasStore.width/$canvasStore.zoom;
    $: toX = scaledWidth+toFromOffset;
    $: fromX = 0+toFromOffset;
    $: rangeX = range(toX, fromX, 11, true);
    $: console.log(rangeX);
</script>

<div class="x-ruler">
    {#each rangeX as i}
        {@const iScaled = i/$canvasStore.zoom}
        {@const iOffsetForDisplay = i-$canvasStore.width/2}

        {@const pos = (iScaled)}
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

