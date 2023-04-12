<script>
    import { getContext, createEventDispatcher } from "svelte";
    import Button from "../Button.svelte";

    const canvasStore = getContext('canvasStore');
    const dispatch = createEventDispatcher();

    function dispatchSetActiveMode(mode) {
        dispatch('setActiveMode', mode);
    }
</script>

<div class="control-panel">
    <!--modes-->
    <div class="control-group">
        <Button icon="draw" active={$canvasStore.activeMode=='draw'} label="draw tool" onclick={()=>dispatchSetActiveMode('draw')} />
        <Button icon="pan_tool" active={$canvasStore.activeMode=='grab'} label="grab tool" onclick={()=>dispatchSetActiveMode('grab')} />
        <Button icon="delete" active={$canvasStore.activeMode=='delete'} label="delete tool" onclick={()=>dispatchSetActiveMode('delete')} />
    </div>

    <!--global actions-->
    <div class="control-group">
        <Button icon="clear_all" label="clear all" />
    </div>

    <div class="piece-settings">
        <input bind:value={$canvasStore.pieceSettings.size} type="range" min="1" step="1" max="100" >
        <input bind:value={$canvasStore.pieceSettings.color} type="color" >
        <input bind:value={$canvasStore.pieceSettings.shadowSize} type="range" min="0" step="1" max="100" >
        <input bind:value={$canvasStore.pieceSettings.shadowColor} type="color" >

    </div>
</div>

<style>
    .control-group {
        margin: 5px;
    }
    .control-group>:global(.button-component) {
        margin: 2px;
    }
</style>
