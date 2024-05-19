<script lang="ts">
    import { getContext, createEventDispatcher, SvelteComponent } from "svelte";
    import Button from "../Button.svelte";
    import Modal from "../Modal.svelte";
    import Dev from "../Dev.svelte";
    import { CanvasModes } from "./enums/modes";
    import { CanvasActions } from "./enums/actions";
    import type { CanvasStore as CanvasStore } from "./types/canvas";
    import type { Writable } from "svelte/store";
    import { appStore } from '../../store';
    import Toggle from "../Inputs/Toggle.svelte";

    const canvasStore:Writable<CanvasStore> = getContext('canvasStore');
    const dispatch = createEventDispatcher();

    $: if ($appStore.controlPanelHeight) {
        document.body.style.setProperty('--control-panel-height', `${$appStore.controlPanelHeight}px`);
    }

    let brushSettingsModal:SvelteComponent;

    let resIsLocked:boolean = true;

    function dispatchSetActiveMode(mode: CanvasModes) {
        dispatch('setActiveMode', mode);
    }

    function dispatchAction(action: CanvasActions) {
        dispatch('action', action);
    }

    function dispatchUpdatedBackgroundColor() {
        dispatch('updatedBackgroundColor');
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

<div bind:clientHeight={$appStore.controlPanelHeight} class="control-panel">
    <!--modes-->
    <div class="control-group">
        <div class="control">
            <Button icon="brush" active={$canvasStore.activeMode==CanvasModes.Draw} label="draw" onclick={()=>dispatchSetActiveMode(CanvasModes.Draw)} />
        </div>
        <div class="control">
            <Button icon="pan_tool_alt" active={$canvasStore.activeMode==CanvasModes.Grab} label="grab" onclick={()=>dispatchSetActiveMode(CanvasModes.Grab)} />
        </div>
        <div class="control">
            <Button icon="pan_tool" active={$canvasStore.activeMode==CanvasModes.Pan} label="pan (Hold Space)" onclick={()=>dispatchSetActiveMode(CanvasModes.Pan)} />
        </div>
        <div class="control">
            <Button icon="delete" active={$canvasStore.activeMode==CanvasModes.Remove} label="remove" onclick={()=>dispatchSetActiveMode(CanvasModes.Remove)} />
        </div>
        <div class="control">
            <p>
                (Use scroll wheel to zoom <em>{$canvasStore.zoom.toFixed(2)}</em>)
            </p>
        </div>
    </div>

    <!--global actions-->
    <div class="control-group">
        <div class="control">
            <label for="">background color</label>
            <input bind:value={$canvasStore.backgroundColor} type="color" on:input={dispatchUpdatedBackgroundColor} >
        </div>
        <div class="control">
            <label for="">show ruler</label>
            <Toggle bind:value={$canvasStore.showRuler} />
        </div>
        <div class="control">
            <label for="">show grid</label>
            <Toggle bind:value={$canvasStore.showGrid} />
        </div>
        <div class="control">
            <label for="">snap to grid</label>
            <Toggle bind:value={$canvasStore.snapToGrid} disabled={true} />
        </div>
        <div class="control">
            <Button icon="clear_all" label="clear all" onclick={()=>dispatchAction(CanvasActions.Clear)} />
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

<style lang="postcss">
    .control-panel {
        @apply flex;
        @apply flex-wrap;
        @apply gap-2;
        @apply px-4;
        @apply z-30;
    }
    .control-group {
        @apply flex-1;
        @apply h-fit;
        @apply w-fit;
        @apply py-4;
        @apply flex;
        @apply flex-wrap;
        @apply gap-2;
    }
    .control-group.lock {
        @apply border-b-2;
        @apply border-green-500;
    }
    .control-group>:global(.button-component) {
        @apply m-2;
    }
    .control {
        @apply flex;
        @apply flex-col;
    }
</style>
