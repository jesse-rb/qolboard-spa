<script lang="ts">
    import { page } from '$app/stores';
    import Canvas from "$lib/components/Canvas/Canvas.svelte";

    const id = parseInt($page.params.canvasId);
</script>

<Canvas
    id={id}
/>
