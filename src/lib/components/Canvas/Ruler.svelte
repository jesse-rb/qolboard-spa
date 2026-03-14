<script lang="ts">
    import { colorIsDark, range, roundToTarget } from "../../util";
    import { getContext, onMount } from "svelte";
    import type { Writable } from "svelte/store";
    import type { Canvas } from "./types/canvas";

    interface Props {
        isHorizontal?: boolean;
    }

    let { isHorizontal = true }: Props = $props();

    const canvasStore: Writable<Canvas> = getContext("canvasStore");
    let rulerStep: number = $state(100);
    let rulerRange: Array<number> = $state([]);

    // RangeX zoom point variables
    let nextRangeZoomIn = $state($canvasStore.canvas_data.zoom * 1.5);
    let nextRangeZoomOut = $state($canvasStore.canvas_data.zoom);

    onMount(() => {
        // Update range start/end
        const end = roundToTarget(-1 * pan + zoomDelta + length, rulerStep);
        const start = roundToTarget(-1 * (pan + zoomDelta), rulerStep);

        // Update range
        rulerRange = range(end, start, rulerStep);
    });

    function panLeftRange() {
        const start = rulerRange[0];
        rulerRange = [start - rulerStep, ...rulerRange.slice(0, -1)];
    }

    function panRightRange() {
        const iEnd = rulerRange.length - 1;
        const end = rulerRange[iEnd];
        rulerRange = [...rulerRange.slice(1), end + rulerStep];
    }

    function zoomInRange() {
        // Set the next range zoom stepping points
        nextRangeZoomOut = nextRangeZoomIn;
        nextRangeZoomIn = nextRangeZoomIn * 2;

        const offset = (rulerRange.length / 2 / 2) * rulerStep;

        const newStepX = rulerStep * 0.5;

        // Update stepX
        rulerStep = newStepX;

        // Update range start/end
        const end = roundToTarget(-1 * pan + zoomDelta + length, rulerStep);
        const start = roundToTarget(-1 * (pan + zoomDelta), rulerStep);

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
        const end =
            roundToTarget(-1 * pan + zoomDelta + length, rulerStep) +
            roundToTarget(rulerStep * rulerRange.length * 0.25, rulerStep);
        const start =
            roundToTarget(-1 * (pan + zoomDelta), rulerStep) -
            roundToTarget(rulerStep * rulerRange.length * 0.25, rulerStep);

        // Update range
        rulerRange = range(end, start, rulerStep);
    }
    let length = $derived(
        (isHorizontal
            ? $canvasStore.canvas_data.width
            : $canvasStore.canvas_data.height) ?? 0,
    );
    let pan = $derived(
        isHorizontal
            ? $canvasStore.canvas_data.xPan
            : $canvasStore.canvas_data.yPan,
    );
    let zoomDelta = $derived(
        isHorizontal
            ? $canvasStore.canvas_data.zoomDx
            : $canvasStore.canvas_data.zoomDy,
    );
    $effect.pre(() => {
        if (length) {
            // Update range start/end
            const end = roundToTarget(-1 * pan + zoomDelta + length, rulerStep);
            const start = roundToTarget(-1 * (pan + zoomDelta), rulerStep);

            // Update range
            rulerRange = range(end, start, rulerStep);
            // rulerRange = range(length, 0, rulerStep);
        }
    });
    // Update our ruler to/form range when panning the canvas
    $effect.pre(() => {
        if (
            -1 * pan + zoomDelta + length >
            rulerRange[rulerRange.length - 1] + rulerStep
        ) {
            panRightRange();
        }
    });
    $effect.pre(() => {
        if (-1 * (pan + zoomDelta) < rulerRange[0] - rulerStep) {
            panLeftRange();
        }
    });
    $effect.pre(() => {
        if ($canvasStore.canvas_data.zoom >= nextRangeZoomIn) {
            zoomInRange();
        }
    });
    $effect.pre(() => {
        if ($canvasStore.canvas_data.zoom < nextRangeZoomOut) {
            zoomOutRange();
        }
    });
</script>

<div
    class="{isHorizontal ? 'x' : 'y'} ruler pointer-events-none {colorIsDark(
        $canvasStore.canvas_data.backgroundColor,
    )
        ? 'text-white'
        : 'text-black'}"
>
    {#each rulerRange as i}
        {@const pos = (i + pan + zoomDelta) * $canvasStore.canvas_data.zoom}
        {#if $canvasStore.canvas_data.rulerSettings.showUnits}
            <span
                class="opacity-50 absolute font-mono"
                style="{isHorizontal ? 'left' : 'top'}: {pos}px;">{i}</span
            >
        {/if}
        {#if $canvasStore.canvas_data.rulerSettings.showLines}
            <div
                class="opacity-10 grid absolute bg-gray-50 overflow-hidden pointer-events-none"
                style={isHorizontal ? `left: ${pos}px` : `top: ${pos}px;`}
            ></div>
        {/if}
    {/each}
</div>

<style>
    .ruler {
        font-size: small;
        position: fixed;
    }
    .x.ruler {
        right: var(--canvas-offset-right);
        top: var(--canvas-offset-top);
        left: 0;
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
        top: var(--canvas-offset-top);
        left: 0;
        bottom: 0;
        right: var(--canvas-offset-right);
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
