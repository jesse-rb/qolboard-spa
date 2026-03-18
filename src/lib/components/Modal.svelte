<script lang="ts">
    import { fade, slide } from "svelte/transition";
    import Button from "./Button.svelte";
    interface Props {
        children?: import("svelte").Snippet;
    }

    let { children }: Props = $props();
    let open = $state(false);

    export const toggle = () => {
        open = !open;
    };
    export const show = () => {
        open = true;
    };
    export const close = (e: Event) => {
        if (e.target == e.currentTarget) {
            open = false;
        }
    };
</script>

{#if open}
    <div class="modal-component">
        <div
            transition:fade
            onclick={close}
            onkeydown={close}
            role="button"
            tabindex="-1"
            class="modal-component outer"
        >
            <!--empty div to simulate containing div with opacity that does not affect child elements opacity-->
        </div>
        <div transition:slide class="inner">
            <div class="close-button">
                <Button icon="close" onclick={toggle} />
            </div>
            {@render children?.()}
        </div>
    </div>
{/if}

<style>
    .modal-component {
        z-index: 10000;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .outer {
        z-index: unset;
        background-color: #303030;
        opacity: 0.5;
    }
    .inner {
        z-index: 1;
        display: inline-block;
        height: fit-content;
        margin-left: auto;
        margin-right: auto;
        background-color: var(--color-back-2);
        border-radius: 5px;
        padding: 20px;
        border-top: var(--color-back-3) solid 10px;
        border-bottom: var(--color-back-3) solid 10px;
        opacity: 1;
    }
    .close-button {
        position: relative;
        float: right;
        right: 0px;
        top: 0px;
    }
</style>

