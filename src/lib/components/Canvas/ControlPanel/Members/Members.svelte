<script lang="ts">
    import { getContext, onMount } from "svelte";
    import type { Writable } from "svelte/store";
    import Member from "./Member.svelte";
    import type { Canvas } from "../../types/canvas.js";

    export let isExpanded;

    const canvasStore: Writable<Canvas> = getContext("canvasStore");
    console.log($canvasStore.canvas_shared_accesses);

    onMount(() => {});
</script>

<div class="control-group">
    <h1 class:hidden={!isExpanded}>Members</h1>

    {#if ($canvasStore.canvas_shared_accesses ?? []).length <= 0}
        <span>No members, use invite links below</span>
    {:else}
        {#each $canvasStore.canvas_shared_accesses ?? [] as d}
            <Member data={d} />
        {/each}
    {/if}
</div>
