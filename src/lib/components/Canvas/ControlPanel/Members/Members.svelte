<script lang="ts">
    import { getContext, onMount } from "svelte";
    import type { Writable } from "svelte/store";
    import Member from "./Member.svelte";
    import type { Canvas } from "../../types/canvas.js";
    import { removeFromArrayByIndex } from "$lib/util";
    import { appStore } from "$lib/store";

    export let isExpanded;

    const canvasStore: Writable<Canvas> = getContext("canvasStore");
    const isCanvasOwner = $canvasStore.user?.uuid == $appStore.user.uuid;

    onMount(() => {});
</script>

<div class="control-group">
    <h1 class:hidden={!isExpanded}>Members</h1>

    <div class="flex w-full gap-1">
        <span class="material-icons text-fore2 p-[10px]">person</span>
        <span class="bg-back_2 rounded-md p-2 h-full">
            {$canvasStore.user?.email ?? "Unkown"}
            {isCanvasOwner ? "(me)" : ""}
        </span>
    </div>

    {#if ($canvasStore.canvas_shared_accesses ?? []).length <= 0}
        <span>No members, use invite links below</span>
    {:else}
        {#each $canvasStore.canvas_shared_accesses ?? [] as d, i}
            <Member
                on:deleted={() =>
                    ($canvasStore.canvas_shared_accesses =
                        removeFromArrayByIndex(
                            $canvasStore.canvas_shared_accesses ?? [],
                            i,
                        ))}
                data={d}
            />
        {/each}
    {/if}
</div>
