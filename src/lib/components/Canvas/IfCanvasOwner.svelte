<script lang="ts">
    import { getContext } from "svelte";
    import type { Writable } from "svelte/store";
    import type { Canvas } from "./types/canvas";
    import { appStore } from "$lib/store";
    interface Props {
        children?: import("svelte").Snippet;
    }

    let { children }: Props = $props();

    const canvasStore: Writable<Canvas> = getContext("canvasStore");
    const isCanvasOwner = $appStore.user.id === $canvasStore.user?.id;
</script>

{#if isCanvasOwner}
    {@render children?.()}
{/if}
