<script>
    import { onMount } from "svelte";

    export let label = '';
    export let type = 'text';
    export let properties = {};
    export let events = [];
    export let value = '';

    let input;

    // Aply events
    onMount(() => {
        // Apply prop events to our input
        for (let e of events) {
            input.addEventListener(e['on'], e['callback']);
        }
    });
</script>

<div class="input-component {type}">
    <span>{label}</span>
    {#if type == 'select'}
        <select bind:this={input} bind:value={value} { ...properties }></select>
    {:else}
        <input bind:this={input} bind:value={value} { ...properties }>
    {/if}
</div>

<style>
    .input-component {
        background-color: #383643;
        padding: 10px;
        width: fit-content;
        border-radius: 5px;
        color: #d59b97;
        font-size: large;
    }
    input {
        background-color: #2a2134;
        border: none;
        color: #d59b97;
        font-size: large;
        padding: 10px;
        border-radius: 5px;
        outline: none;
        width: 100%;
    }
</style>