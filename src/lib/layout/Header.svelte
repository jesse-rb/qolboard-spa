<script>
    import Modal from '../components/Modal.svelte';
    import Button from '../components/Button.svelte';
    import { store } from '../store';

    let aboutModal;

    let loginEmail = "";

    // Load cached store
    let cachedStore = window.localStorage.getItem('store');
    if (cachedStore) {
        $store = JSON.parse(cachedStore);
    }
    
    // Cahce store
    $: window.localStorage.setItem('store', JSON.stringify($store));
</script>

<div class="header-layout">
    <div class="banner">
        <h1>Welcome to qolboard 2.0</h1>

        <Button label="About" icon="info" onclick={()=>{
            aboutModal.toggle();
        }} />
    </div>
</div>

<Modal bind:this={aboutModal}>
    <h2>About</h2>
    <h3>Privacy note</h3>
    <p>Please note that qolboard uses:</p>
    <ul>
        <li>session storage to carry your drawings over between page refreshes</li>
        <li>server memory to sync your drawing with anyone who joins the 'room' which you are currently in.</li>
    </ul>
    <p>Therefore <em>please do not use qolboard for any personal or private details</em>.</p>
    <h3>Github</h3>
    <a href="https://github.com/jesse-rb" target="_blank" rel="noopener noreferrer">github.com/jesse-rb</a>
</Modal>

<style>
    .header-layout {
        display: flex;
        align-items: center;
        background-color: var(--color-back-2);
        align-items: stretch;
        height: 100px;
    }
    .banner {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-grow: 1;
        padding: 20px;
        flex-wrap: wrap;
    }
    .banner :global(.button-component) {
        margin-left: 10px;
    }
    h1 {
        margin: 0;
    }

    @media only screen and (max-width: 800px) {
        .banner :global(.button-component) {
            flex-grow: 100;
            flex-basis: 100%;
        }
    }
</style>