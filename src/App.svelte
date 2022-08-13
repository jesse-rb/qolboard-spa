<script>
    // This is the app's page and can be used for routing
    import { Router, Route } from 'svelte-navigator';
    import Header from './lib/layout/Header.svelte';
    import Home from './lib/pages/Home.svelte';
</script>

<main>
    <Router>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <Header />
        <div id="page">
                <Route>
                        <Home />
                </Route>
                <Route path="/board">
                        <!-- <Board /> -->
                </Route>
        </div>
        <!-- <Footer /> -->
    </Router>
</main>

<style>
    #page {
        margin: 0 30px 0 30px;
    }
</style>
