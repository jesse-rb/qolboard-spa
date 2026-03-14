<script lang="ts">
    import { page } from "$app/state";
    import Canvas from "$lib/components/Canvas/Canvas.svelte";

    let id = undefined;
    if (page.params.canvasId) {
        id = parseInt(page.params.canvasId);
    }
</script>

<Canvas {id} />
