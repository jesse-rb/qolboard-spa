<script>
	// This is the app's page and can be used for routing
	import { Router, Route, Link } from 'svelte-navigator';
	import Header from './layout/Header.svelte';
	import Home from './pages/Home.svelte';
</script>
<div id="app">
	<Router>
		<Header />
		<div id="page">
			<Route>
				<Home />
			</Route>
		</div>
		<!-- <Footer /> -->
	</Router>
</div>

<style>
	#page {
		margin: 0 30px 0 30px;
	}
</style>