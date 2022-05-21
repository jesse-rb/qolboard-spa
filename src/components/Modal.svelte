<script>
    import { elasticOut } from 'svelte/easing';
    import { slide } from 'svelte/transition';
    import Button from './Button.svelte';
    export let cinema = false;
    let open = false;
    export const toggle = () => {open = !open};

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
    <div class="modal-component" class:cinema={cinema}>
        <div in:slide out:slide="{{ delay:400 }}" class="modal-component-inner">
            <div in:transitionCloseButton="{{delay: 400}}" out:transitionCloseButton="{{delay: 0}}" class="close-button">
                <Button label="x" onclick={toggle} />
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
        display: none;
        position: relative;
        background-color: #2c2035;
        border-radius: 10px;
        padding: 10px;
        margin: 30px;
        /* box-shadow: #8d4848 -1px 1px 1px 0px; */
        border: #383643 1px solid;
    }
    .modal-component.cinema {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 1000;
        background-color: rgba(56, 54, 67, 0.7);
    }
    .modal-component.cinema .modal-component-inner {
        margin: 0 auto 0 auto;
        top: 25%;
        width: 50%;
        height: 50%;
        z-index: 1050;
    }
    .modal-component .modal-component-inner {
        display: block;
    }

    .modal-component .close-button {
        position: relative;
        float: right;
        right: -20px;
        top: -20px;
    }
</style>