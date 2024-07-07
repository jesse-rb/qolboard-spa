<script lang="ts">
    import Modal from '../components/Modal.svelte';
    import Button from '../components/Button.svelte';
    import Auth from '../components/Auth/Auth.svelte';
    import { appStore } from '../store';
    import { inject as injectVercelAnalytics } from '@vercel/analytics' // Vercel analytics
    import type { SvelteComponent } from 'svelte';

    injectVercelAnalytics();

    let aboutModal:Modal;
    let registerModal:Modal;
    let loginModal:Modal;
    
    let logoutIsLoading = false;

    // Load cached store
    let cachedAppStore = null;//window.sessionStorage.getItem('appStore');
    if (cachedAppStore) {
        $appStore = JSON.parse(cachedAppStore);
    }
    
    // Cahce store
    // $: window.sessionStorage.setItem('appStore', JSON.stringify($appStore));

    $: if ($appStore.headerHeight) {
        document.body.style.setProperty('--header-height', `${$appStore.headerHeight}px`);
    }

    async function logout() {
        logoutIsLoading = true;

        const domain = import.meta.env.VITE_API_HOST;
        const path = "user/logout";
        const url = `${domain}/${path}`;

        const response = await fetch(url, {
            method: "POST",
            credentials: "include",
            headers: {
                "content-type": "application/json"
            }
        });

        if (response.ok) {
            $appStore.isAuthenticated = false
        }

        logoutIsLoading = false;
    }
</script>

<div bind:clientHeight={$appStore.headerHeight} class="header-layout">
    <div class="banner">
        <div class="flex items-center gap-2">
            <a href="/">
                <h1>qolboard 2.0</h1>
            </a>

            <Button
                label="About"
                icon="info"
                onclick={() => {
                    aboutModal.toggle();
                }}
            />
        </div>

        <div class="flex items-center gap-2">
            <a href="/canvas">My Canvases</a>
            {#if !$appStore.isAuthenticated}
                <Button
                    label="Register"
                    icon="person"
                    onclick={() => {
                        registerModal.toggle();
                    }}
                />
                <Button
                    label="Login"
                    icon="login"
                    onclick={() => {
                        loginModal.toggle();
                    }}
                />
            {:else}
                <p>{$appStore.email}</p>
                <Button
                    label="Logout"
                    icon="logout"
                    onclick={logout}
                    bind:isLoading={logoutIsLoading}
                />
            {/if}
        </div>
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

{#if !$appStore.isAuthenticated}
    <Modal bind:this={loginModal}>
        <Auth />
    </Modal>

    <Modal bind:this={registerModal}>
        <Auth isRegistration />
    </Modal>
{/if}

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
        justify-content: space-between;
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