<script>
import { onMount } from "svelte";


    let formElement;

    onMount(()=> {
        formElement.addEventListener('submit', (e)=>e.preventDefault());
    });
</script>

<form bind:this={formElement} action="">
    <slot></slot>
</form>