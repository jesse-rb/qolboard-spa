<script lang="ts">
    import Modal from "../components/Modal.svelte";
    import Button from "../components/Button.svelte";
    import Auth from "../components/Auth/Auth.svelte";
    import { appStore, getUser } from "../store";
    import { inject as injectVercelAnalytics } from "@vercel/analytics"; // Vercel analytics
    import { onMount } from "svelte";
    import { request } from "$lib/http";

    injectVercelAnalytics();

    let aboutModal: Modal | undefined = $state();
    let registerModal: Modal | undefined = $state();
    let loginModal: Modal | undefined = $state();

    let logoutIsLoading = $state(false);

    const authenticatedRoutes = ["/canvas"];

    $effect.pre(() => {
        if ($appStore.headerHeight) {
            document.body.style.setProperty(
                "--header-height",
                `${$appStore.headerHeight}px`,
            );
        }
    });

    $effect.pre(() => {
        if (!$appStore.isAuthenticated && $appStore.checkedIsAuthenticated) {
            if (window.location.pathname !== "/") {
                if (isAuthenticatedRoute(window.location.pathname)) {
                    window.location.assign("/");
                }
            }
        }
    });

    onMount(async () => {
        await getUser();
    });

    function isAuthenticatedRoute(path: string): boolean {
        return (
            authenticatedRoutes.filter(
                (route) => route === path.substring(0, route.length),
            ).length > 0
        );
    }

    async function logout() {
        logoutIsLoading = true;

        const path = "user/logout";

        const response = await request("POST", path);

        if (response.ok) {
            $appStore.isAuthenticated = false;
        }

        logoutIsLoading = false;
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

            {#if $appStore.error}
                <div class="error">
                    <p>{$appStore.error}</p>
                </div>
            {/if}
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
                    isLoading={logoutIsLoading}
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
        Please note that qolboard 2.0 is in a <em>beta</em> stage of early development
        and is only a side project. Therefore please bear with us while it is possible
        for breaking changes to occur occasionally that could affect existing canvases,
        or erase ALL data.
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
