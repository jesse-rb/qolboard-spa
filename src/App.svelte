<script>
    import Header from './lib/layout/Header.svelte';
    import Home from './lib/pages/Home.svelte';
    import { inject as injectVercelAnalytics } from '@vercel/analytics' // Vercel analytics

    injectVercelAnalytics();
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
