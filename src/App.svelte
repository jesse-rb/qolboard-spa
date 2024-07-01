<script>
    import Header from './lib/layout/Header.svelte';
    import Index from './lib/pages/Canvas/Index.svelte';
    import Home from './lib/pages/Home.svelte';
    import { inject as injectVercelAnalytics } from '@vercel/analytics' // Vercel analytics

    injectVercelAnalytics();

    const path = window.location.pathname;
    const parts = path.split("/");
</script>

<main>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <Header />
    
    <div id="page">
        {#if (path === "/canvas/index")}
            <Index />
        {:else if path === "/canvas/:param"}
            <Home id="5" />
        {:else}
            <Home />
        {/if}
    </div>
</main>

<style>
    
</style>
