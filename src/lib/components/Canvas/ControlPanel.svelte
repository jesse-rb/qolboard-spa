<script>
    import { getContext, createEventDispatcher } from "svelte";
    import Button from "../Button.svelte";
    import Modal from "../Modal.svelte";

    const canvasStore = getContext('canvasStore');
    const dispatch = createEventDispatcher();

    let controlsModal;

    let resIsLocked = true;
    let colorIsLocked = true;

    function dispatchSetActiveMode(mode) {
        dispatch('setActiveMode', mode);
    }

    function toggleColorLock() {
        colorIsLocked = !colorIsLocked;
        updateLockedColor();
    }
    function toggleResLock() {
        resIsLocked = !resIsLocked;
        updateLockedRes();
    }

    function updateLockedColor(setColor=false) {
        if (colorIsLocked) {
            if (setColor) {
                $canvasStore.pieceSettings.color = $canvasStore.pieceSettings.shadowColor;
            }
            else {
                $canvasStore.pieceSettings.shadowColor = $canvasStore.pieceSettings.color;
            }
        }
    }
    function updateLockedRes(setX=false) {
        if (resIsLocked) {
            if (setX) {
                $canvasStore.pieceSettings.resX = $canvasStore.pieceSettings.resY;
            }
            else {
                $canvasStore.pieceSettings.resY = $canvasStore.pieceSettings.resX;
            }
        }
    }

</script>

<div class="control-panel">
    <!--modes-->
    <div class="control-group">
        <Button icon="brush" active={$canvasStore.activeMode=='draw'} label="draw" onclick={()=>dispatchSetActiveMode('draw')} />
        <Button icon="pan_tool_alt" active={$canvasStore.activeMode=='grab'} label="grab" onclick={()=>dispatchSetActiveMode('grab')} />
        <Button icon="delete" active={$canvasStore.activeMode=='remove'} label="remove" onclick={()=>dispatchSetActiveMode('remove')} />
    </div>

    <!--global actions-->
    <div class="control-group">
        <div class="control">
            <label for="">background color</label>
            <input bind:value={$canvasStore.backgroundColor} type="color" >
        </div>
        <div class="control">
            <Button icon="clear_all" label="clear all" />
        </div>
    </div>

    <div class="control-group">
        <Button label="tune brush" icon="tunebrush" onclick={()=>{ controlsModal.toggle(); }} />
        <Button label="tune canvas" icon="tunenote_alt" onclick={()=>{ controlsModal.toggle(); }} />
    </div>
    
</div>

<Modal bind:this={controlsModal}>
    <div class="control-group">
        <div class="control-group">
            <div class="control">
                <label for="">size</label>
                <input bind:value={$canvasStore.pieceSettings.size} type="range" min="1" step="1" max="100" >
            </div>

            <div class="control">
                <label for="">shadow size</label>
                <input bind:value={$canvasStore.pieceSettings.shadowSize} type="range" min="0" step="1" max="100" >
            </div>
        </div>

        <div class="control-group lock">
            <div class="control">
                <label for="">color</label>
                <input bind:value={$canvasStore.pieceSettings.color} type="color" on:input={()=>updateLockedColor()} >
            </div>

            <div class="control">
                <label for="">shadow color</label>
                <input bind:value={$canvasStore.pieceSettings.shadowColor} type="color" on:input={()=>updateLockedColor(true)} >
            </div>

            <Button icon={colorIsLocked ? 'lock' : 'lock_open'} onclick={toggleColorLock}/>
        </div>

        <div class="control-group lock">
            <div class="control">
                <label for="">x resolution</label>
                <input bind:value={$canvasStore.pieceSettings.resX} type="range" min="1" step="1" max="100" on:input={()=>updateLockedRes()}>
            </div>

            <div class="control">
                <label for="">y resolution</label>
                <input bind:value={$canvasStore.pieceSettings.resY} type="range" min="1" step="1" max="100" on:input={()=>updateLockedRes(true)}>
            </div>

            <Button icon={resIsLocked ? 'lock' : 'lock_open'} onclick={toggleResLock}/>
        </div>
    </div>
</Modal>

<style>
    .control-panel {
        height: 100px;
        display: flex;
        column-gap: 1em;
    }
    .control-group {
        margin: 0 1rem 0 1rem;
        padding: 1rem 0 1rem 0;
        display: flex;
        flex-wrap: wrap;
    }
    .control-group.lock {
        border-bottom: 0.1rem solid green;
    }
    .control-group>:global(.button-component) {
        margin: 2px;
    }
    .control {
        display: flex;
        flex-direction: column;
        margin: 0 1rem 0 1rem;
    }
</style>
