<script>
    import "$lib/app.css";
    import Header from "$lib/layout/Header.svelte";

    // export const ssr = false; // Disable ssr

</script>

<Header />
<main>
    <slot></slot>
</main>

<style lang="postcss">

</style>