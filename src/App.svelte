<script>
    import Header from './lib/layout/Header.svelte';
    import Index from './lib/pages/Canvas/Index.svelte';
    import Home from './lib/pages/Home.svelte';
    import { inject as injectVercelAnalytics } from '@vercel/analytics' // Vercel analytics

    injectVercelAnalytics();

    // const routes = {
    //     '/': Home,
    //     '/canvas/index': Index,
    //     '/canvas/index/:id': Home,
    //     '*': Home,
    // }
</script>

<main>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <Header />
    
    <div id="page">
        <Home />
    </div>
</main>

<style>
    
</style>
