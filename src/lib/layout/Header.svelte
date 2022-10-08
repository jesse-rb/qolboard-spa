<script>
    import Input from '../components/Input.svelte';
    import Modal from '../components/Modal.svelte';
    import Button from '../components/Button.svelte';
    import Form from '../components/Form.svelte'
    import { emailSignInLink, completeSignInWithEmailLink, logout } from '../util/firebase';
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

    if (!$store['loggedIn'] && $store['logInProgressEmail']) {
        completeSignInWithEmailLink($store['logInProgressEmail'])
        .then(data => {
            console.log(data);
            if (!data['err']) {
                $store['loggedIn'] = true;
                $store['user'] = data['data'];
            } else {
                completeSignInFailedModal.toggle();
            }
            $store['logInProgressEmail'] = null;
        });
        
    }

    function login() {
        emailSignInLink(loginEmail);
        $store['logInProgressEmail'] = loginEmail;
        loginModal.close();
        loginInstructionsModal.toggle();
    }
</script>

<div class="header-layout">
    <div class="banner">
        <h1>Welcome to qolboard 2.0</h1>
        
        {#if !$store['loggedIn']}
        <Button label="Login" icon="login" onclick={()=>{
            loginModal.toggle();
        }} />
        {:else}
            <Button label="Logout" icon='logout' onclick={logout}></Button>
        {/if}

        <Button label="About" icon="info" onclick={()=>{
            aboutModal.toggle();
        }} />
        
        {#if $store['loggedIn']}
            <div class="status">
                <span class="material-icons">verified_user</span>
                <span>You are logged in</span>
            </div>
        {/if}
    </div>
</div>

<Modal bind:this={loginModal}>
    <h2>Login</h2>
    <Form>
        <Input bind:value={loginEmail} label="Email" properties={{type:'text', id:'email'}} />
        <Button label="Login" onclick={login}></Button>
    </Form>
</Modal>

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
    .status {
        margin: 5px;
        display: flex;
        align-items: center;
    }

    @media only screen and (max-width: 800px) {
        .banner :global(.button-component) {
            flex-grow: 100;
            flex-basis: 100%;
        }
    }
</style>