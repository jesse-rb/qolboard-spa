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
        <Button icon="pan_tool" active={$canvasStore.activeMode=='move'} label="move tool" onclick={()=>dispatchSetActiveMode('move')} />
        <Button icon="delete" active={$canvasStore.activeMode=='delete'} label="delete tool" onclick={()=>dispatchSetActiveMode('delete')} />
    </div>

    <!--global actions-->
    <div class="control-group">
        <Button icon="clear_all" label="clear all" />
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