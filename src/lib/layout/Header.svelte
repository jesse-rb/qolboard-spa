<script lang="ts">
    import Modal from "../components/Modal.svelte";
    import Button from "../components/Button.svelte";
    import Auth from "../components/Auth/Auth.svelte";
    import { appStore, getUser } from "../store";
    import { inject as injectVercelAnalytics } from "@vercel/analytics"; // Vercel analytics
    import { onMount } from "svelte";

    injectVercelAnalytics();

    let aboutModal: Modal;
    let registerModal: Modal;
    let loginModal: Modal;

    let logoutIsLoading = false;

    $: if ($appStore.headerHeight) {
        document.body.style.setProperty(
            "--header-height",
            `${$appStore.headerHeight}px`,
        );
    }

    onMount(async () => {
        const urlHashesStr = window.location.hash.substring(1);
        const urlHashes = urlHashesStr.split("&");

        const emailVerifiedReturnState: {
            type?: string;
            access_token?: string;
            expires_in?: string;
        } = {};
        for (const hash of urlHashes) {
            const [k, v] = hash.split("=");
            if (k === "type") {
                emailVerifiedReturnState.type = v;
            }
            if (k === "access_token") {
                emailVerifiedReturnState.access_token = v;
            }
            if (k === "expires_in") {
                emailVerifiedReturnState.expires_in = v;
            }
        }
        if (emailVerifiedReturnState.type === "signup") {
            // window.location.search = "";
            const token = emailVerifiedReturnState.access_token ?? "";
            const expiresIn = emailVerifiedReturnState.expires_in ?? "0";

            setToken(token, parseInt(expiresIn));
        } else {
            getUser();
        }
    });

    async function logout() {
        logoutIsLoading = true;

        const domain = import.meta.env.VITE_API_HOST;
        const path = "user/logout";
        const url = `${domain}/${path}`;

        const response = await fetch(url, {
            method: "POST",
            credentials: "include",
            headers: {
                "content-type": "application/json",
            },
        });

        if (response.ok) {
            $appStore.isAuthenticated = false;
        }

        logoutIsLoading = false;
    }

    async function setToken(token: string, expires_in: number) {
        // User has returned from verifying their email, login via JWT token
        const domain = import.meta.env.VITE_API_HOST;
        const path = "auth/set_token";
        const url = `${domain}/${path}`;
        const body = {
            token: token,
            expires_in: expires_in,
        };

        const response = await fetch(url, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify(body),
            headers: {
                "content-type": "application/json",
            },
        });
        if (response.ok) {
            const responseBody = await response.json();
            $appStore.isAuthenticated = true;
            $appStore.user = responseBody.data;
        } else {
            $appStore.isAuthenticated = false;
            $appStore.user.email = "";
            $appStore.user.uuid = "";
        }
    }
</script>

<div bind:clientHeight={$appStore.headerHeight} class="header-layout">
    <div class="banner gap-2">
        <div class="flex items-center gap-2 w-full sm:w-fit">
            <a class="shrink-0" href="/">
                <img
                    class="h-8"
                    src="/qolboard.svg"
                    alt="A simple qolboard scribble logo"
                />
            </a>

            <Button
                label="About"
                icon="info"
                onclick={() => {
                    aboutModal.toggle();
                }}
            />
        </div>

        <div class="flex flex-wrap items-center gap-2 w-full sm:w-fit">
            {#if $appStore.isAuthenticated}
                <a href="/canvas">My Canvases</a>
            {/if}
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
                <p>{$appStore.user.email}</p>
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
    <!--Open beta-->
    <h3 class="flex items-center gap-2">
        <span class="material-icons text-fore2">science</span>
        <span>Open Beta</span>
    </h3>
    <p>
        Please note that qolboard 2.0 is in a <em>beta</em> stage of early development.
        Therefore please bear with us while it is possible for breaking changes to
        occur occasionally that could affect existing canvases.
    </p>

    <!--Attributions-->
    <h3 class="flex items-center gap-2">
        <span class="material-icons text-fore2">attribution</span>
        <span>Attributions</span>
    </h3>
    <ul>
        <li>
            <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://svelte.dev/">Svelte</a
            >
        </li>
        <li>
            <a target="_blank" rel="noopener noreferrer" href="https://go.dev/"
                >Golang</a
            >
        </li>
        <li>
            <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://fonts.google.com/icons"
                >Google material design icons</a
            >
        </li>
    </ul>

    <!--Github-->
    <h3 class="flex items-center gap-2">
        <span class="material-icons text-fore2">code</span>
        <span>Github</span>
    </h3>
    <a
        href="https://github.com/jesse-rb"
        target="_blank"
        rel="noopener noreferrer">github.com/jesse-rb</a
    >
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

    @media only screen and (max-width: 800px) {
        .banner :global(.button-component) {
            flex-grow: 100;
            flex-basis: 100%;
        }
    }
</style>
