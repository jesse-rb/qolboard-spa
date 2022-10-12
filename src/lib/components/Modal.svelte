
<script>
    import { slide } from 'svelte/transition';
    import Button from './Button.svelte';
    let open = false;

    export const toggle = () => {open = !open};
    export const close = () => {open = false};
</script>


{#if open}
    <div on:click|self={close} class="modal-component" >
        <div transition:slide class="modal-component-inner">
            <div class="close-button">
                <Button icon="close" onclick={toggle} />
            </div>
            <slot></slot>
        </div>
    </div>
{/if}

<style>
    .modal-component {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background-color: transparent;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .modal-component-inner {
        display: inline-block;
        width: fit-content;
        height: fit-content;
        margin-left: auto;
        margin-right: auto;
        background-color: var(--color-back-2);
        border-radius: 5px;
        padding: 20px;
        /* box-shadow: var(--color-back-2) 0 0 10px 20px; */
        border-top: white solid 5px;
        border-bottom: white solid 5px;
    }
    .modal-component .close-button {
        position: relative;
        float: right;
        right: 0px;
        top: 0px;
    }
</style>