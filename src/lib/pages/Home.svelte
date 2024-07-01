<script lang="ts">
    import { onMount } from 'svelte';
    import Canvas from '../components/Canvas/Canvas.svelte';

    export let id:number = null;



    onMount(()=>{

    });
</script>

<div id="home-page">
    <Canvas
        id={id}
    />
</div>

<style>

</style>