<script lang="ts">
    import "$lib/app.css";
    import Header from "$lib/layout/Header.svelte";
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();
</script>

<Header />
<main>
    {@render children?.()}
</main>

<style lang="postcss">

</style>