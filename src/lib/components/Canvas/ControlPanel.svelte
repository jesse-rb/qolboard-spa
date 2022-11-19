<script>
    import { getContext } from "svelte";
    import Button from "../Button.svelte";

    const canvasStore = getContext('canvasStore');
</script>

<div class="control-panel">
    <!--modes-->
    <div class="control-group">
        <Button icon="draw" active={$canvasStore.activeMode} />
    </div>
</div>

<style>
    
</style>