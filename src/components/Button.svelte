<script>
export let label = '';
export let onclick = () => {};
</script>

<button id="button-component" on:click="{onclick}" class="{label.length <= 1 ? 'symbol' : ''}">{label}</button>

<style>
    #button-component {
        border-radius: 50px;
        padding: 10px;
        border: none;
        background-color: #e78e8e;
    }
    #button-component.symbol {
        border-radius: 50%;
        padding: 0;
        width: 30px;
        height: 30px;
    }
</style>