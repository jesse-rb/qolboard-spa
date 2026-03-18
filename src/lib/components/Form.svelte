<script lang="ts">
import { onMount } from "svelte";
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();


    let formElement = $state();

    onMount(()=> {
        formElement.addEventListener('submit', (e)=>e.preventDefault());
    });
</script>

<form bind:this={formElement} action="">
    {@render children?.()}
</form>