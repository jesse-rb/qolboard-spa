<script>
    import { elasticOut } from 'svelte/easing';
    import { slide } from 'svelte/transition';
    import Button from './Button.svelte';
    let open = false;

    export const toggle = () => {open = !open};
    export const close = () => {open = false};

    function transitionCloseButton(node, { delay }) {
        return {
            delay,
            duration: 800,
            easing: elasticOut,
            css: (t, u) => `
                transform: scale(${t});
            `
        }
    }
</script>


{#if open}
    <div class="modal-component" >
        <div in:slide out:slide="{{ delay:100 }}" class="modal-component-inner">
            <div in:transitionCloseButton="{{delay: 100}}" out:transitionCloseButton="{{delay: 0}}" class="close-button">
                <Button icon="close" onclick={toggle} />
            </div>
            <slot></slot>
        </div>
    </div>
{/if}

<style>
    .modal-component {
        display: contents;
    }
    .modal-component-inner {
        display: block;
        position: relative;
        background-color: #2c2035;
        border-radius: 5px;
        padding: 10px;
        margin: 30px;
        border: #383643 1px solid;
    }
    .modal-component .close-button {
        position: relative;
        float: right;
        right: 0px;
        top: 0px;
    }
</style>