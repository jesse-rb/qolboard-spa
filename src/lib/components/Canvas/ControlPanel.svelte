<script>
    import { getContext, createEventDispatcher } from "svelte";
    import Button from "../Button.svelte";
    import Modal from "../Modal.svelte";
    import Dev from "../Dev.svelte";

    const canvasStore = getContext('canvasStore');
    const dispatch = createEventDispatcher();

    let brushSettingsModal;

    let resIsLocked = true;

    function dispatchSetActiveMode(mode) {
        dispatch('setActiveMode', mode);
    }

    function dispatchAction(action) {
        dispatch('action', action);
    }

    function toggleResLock() {
        resIsLocked = !resIsLocked;
        updateLockedRes();
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
        <div class="control">
            <Button icon="brush" active={$canvasStore.activeMode=='draw'} label="draw" onclick={()=>dispatchSetActiveMode('draw')} />
        </div>
        <div class="control">
            <Button icon="pan_tool_alt" active={$canvasStore.activeMode=='grab'} label="grab" onclick={()=>dispatchSetActiveMode('grab')} />
        </div>
        <div class="control">
            <Button icon="pan_tool" active={$canvasStore.activeMode=='pan'} label="pan (Hold Space)" onclick={()=>dispatchSetActiveMode('pan')} />
        </div>
        <div class="control">
            <Button icon="delete" active={$canvasStore.activeMode=='remove'} label="remove" onclick={()=>dispatchSetActiveMode('remove')} />
        </div>
        <div class="control">
            <p>(Use scroll wheel to zoom)</p>
        </div>
    </div>

    <!--global actions-->
    <div class="control-group">
        <div class="control">
            <label for="">background color</label>
            <input bind:value={$canvasStore.backgroundColor} type="color" >
        </div>
        <div class="control">
            <Button icon="clear_all" label="clear all" onclick={()=>dispatchAction('clear')} />
        </div>
        <Dev>
            <div class="control">
                <Button icon="layers_clear" label="clear session storage" onclick={()=>window.sessionStorage.clear()} />
            </div>
        </Dev>
    </div>

    <div class="control-group">
        <div class="control" >
            <Button label="tune brush" icon="tunebrush" onclick={()=>{ brushSettingsModal.toggle(); }} />
        </div>
    </div>
</div>

<Modal bind:this={brushSettingsModal}>
    <div class="control-group">
        <div class="control-group">
            <div class="control">
                <label for="">size</label>
                <input bind:value={$canvasStore.pieceSettings.size} type="range" min="1" step="1" max="100" >
            </div>
        </div>

        <div class="control-group">
            <div class="control">
                <label for="">color</label>
                <input bind:value={$canvasStore.pieceSettings.color} type="color" >
            </div>
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
        height: var(--control-panel-height);
        display: flex;
        column-gap: 1em;
        align-items: center;
        padding: 0 1rem 0 1rem;
    }
    .control-group {
        height: 100%;
        padding: 1rem 0 1rem 0;
        display: flex;
        flex-wrap: wrap;
        column-gap: 0.2em;
        row-gap: 0.2em;
        width: fit-content;
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
    }
</style>
