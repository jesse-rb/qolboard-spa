<script lang="ts">
    import type { Writable } from "svelte/store";
    import type { Canvas } from "./types/canvas";
    import { getContext } from "svelte";

    export let cursors: Record<string, { x: number; y: number }> = {};

    const canvasStore: Writable<Canvas> = getContext("canvasStore");
</script>

{#each Object.entries(cursors) as [email, pos]}
    {@const x =
        pos.x / $canvasStore.canvasData.zoom + $canvasStore.canvasData.xPan}
    {@const y = pos.y + $canvasStore.canvasData.yPan}
    <div
        class="pointer-events-none fixed"
        style="left: {x}px; top: calc({y}px + var(--header-height));"
    >
        <span class="material-icons">mouse</span>
        <span class="text-xs">{email}</span>
    </div>
{/each}
