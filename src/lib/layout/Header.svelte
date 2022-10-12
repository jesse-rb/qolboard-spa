<script>
    import Input from '../components/Input.svelte';
    import Modal from '../components/Modal.svelte';
    import Button from '../components/Button.svelte';
    import Form from '../components/Form.svelte'
    import { store } from '../store';

    let loginModal;
    let aboutModal;
    let loginInstructionsModal;
    let completeSignInFailedModal;

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

<Modal bind:this={loginInstructionsModal}>
    <h2>Login email sent</h2>
    <span class="material-icons">email</span>
    <p>
        Login link sent to <strong>{$store['logInProgressEmail']}</strong>
    </p>
</Modal>

<Modal bind:this={completeSignInFailedModal}>
    <h2>Log in failed</h2>
    <p>Sorry, something went wrong during login, please try again.</p>
</Modal>

<style>
    .header-layout {
        display: flex;
        align-items: center;
        background-color: var(--color-back-2);
        align-items: stretch;
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