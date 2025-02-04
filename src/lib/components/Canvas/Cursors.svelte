<script lang="ts">
    import type { Writable } from "svelte/store";
    import type { Canvas } from "./types/canvas";
    import { getContext } from "svelte";

    export let cursors: Record<string, { x: number; y: number }> = {};

    const canvasStore: Writable<Canvas> = getContext("canvasStore");
</script>

{#each Object.entries(cursors) as [email, pos]}
    <div
        class="pointer-events-none fixed"
        style="left: {pos.x - 8}px; top: calc({pos.y -
            8}px + var(--header-height));"
    >
        <span class="material-icons">mouse</span>
        <span class="text-xs">{email}</span>
    </div>
{/each}
