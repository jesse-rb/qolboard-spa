<script>
    import Button from './Button.svelte';
    export let cinema = false;
    let open = false;
    export const toggle = () => {open = !open};

</script>

<div id="modal-component" class="{open ? 'open' : ''} {cinema ? 'cinema' : ''}">
    <div id="modal-component-inner">
        <Button label="x" onclick={toggle} />
        <slot></slot>
    </div>
</div>

<style>
    #modal-component {
        display: none;
    }
    #modal-component-inner {
        display: none;
        position: relative;
        background-color: #2c2035;
        border-radius: 10px;
        padding: 10px;
        margin: 10px;
    }
    #modal-component.cinema.open {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 1000;
        background-color: rgba(56, 54, 67, 0.7);
    }
    #modal-component.cinema.open #modal-component-inner {
        margin: 0 auto 0 auto;
        top: 25%;
        width: 50%;
        height: 50%;
        z-index: 1050;
    }
    #modal-component.open {
        display: contents;
    }
    #modal-component.open #modal-component-inner {
        display: block;
    }

    #modal-component :global(#button-component) {
        position: relative;
        float: right;
        right: -20px;
        top: -20px;
    }
</style>