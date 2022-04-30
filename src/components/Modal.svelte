<script>
    import Button from './Button.svelte';
    export let cinema = false;
    let open = false;
    export const toggle = () => {open = !open};

</script>

<div id="modal-component" class="{open ? 'open' : ''} {cinema ? 'cinema' : ''}">
    <Button label="x" onclick={toggle} />
    <slot></slot>
</div>

<style>
    #modal-component {
        display: none;
        position: relative;
        background-color: #2c2035;
        border-radius: 10px;
        padding: 10px;
        margin: 10px;
        box-shadow: 0 0 5px #352979;
    }
    #modal-component.cinema {
        position: absolute;
        margin: 0 auto 0 auto;
        top: 33%;

    }
    #modal-component.open {
        display: block;
    }

    #modal-component :global(#button-component) {
        position: relative;
        float: right;
        right: -20px;
        top: -20px;
    }
</style>