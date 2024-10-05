<script lang="ts">
    import type { Error } from "$lib/types";
    import { teleport } from "$lib/util";
    import { onMount } from "svelte";
    import { appStore } from "../../store";
    import Button from "../Button.svelte";

    type AuthRequestBody = {
        email:string
        password:string
        password_confirmation?:string
    };

    type AuthResponseBody = {
        email:string,
        errors?:Array<Error>
    };

    export let isRegistration:boolean = false;
    export let verified:boolean = false;

    let email = '';
    let password = '';
    let passwordConfirmation = '';

    let isLoading = false;
    
    let errors:Array<Error> = [];

    let ok = false;

    function resetAuthFields() {
        email = '';
        password = '';
        passwordConfirmation = '';
    }

    async function auth() {
        ok = false;
        errors = [];

        isLoading = true;

        const domain = import.meta.env.VITE_API_HOST;
        const path = `auth/${isRegistration ? "register" : "login"}`;
        const url = `${domain}/${path}`;

        const body:AuthRequestBody = {
            email: email,
            password: password
        };

        if (isRegistration) {
            body.password_confirmation = passwordConfirmation
        }

        const response = await fetch(url, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify(body),
            headers: {
                "content-type": "application/json"
            }
        });

        const responseBody:AuthResponseBody = await response.json();

        if (response.ok) {
            ok = true;
            if (isRegistration) {
                
            }
            else {
                $appStore.isAuthenticated = true;
                $appStore.email = responseBody.email;
            }
        }
        else {
            errors = responseBody.errors ?? [];
        }

        resetAuthFields();

        isLoading = false;
    }
</script>

<div>
    <div class="flex flex-col">
        {#if verified}
            <p>Thank you for verifying your email, you can now log in</p>
        {/if}
        <input id="email" bind:value={email} type="email" placeholder="Email">
        <input id="password" bind:value={password} type="password" placeholder="Password">

        {#if isRegistration}
            <input id="password_confirmation" bind:value={passwordConfirmation} type="password" placeholder="Confirm password">
        {/if}
    </div>

    <Button
        label="{isRegistration ? "Register" : "Login"}"
        onclick={auth}
        icon="send"
        bind:isLoading={isLoading}
        disabled={isLoading}
    />

    {#if ok}
        <p>Thank you</p>
    {/if}

    {#if errors.length > 0}
        {#each errors as error (error.field)}
            <p use:teleport="{{id:error.field}}" class="text-red-400 text-sm">{error.message}</p>
        {/each}
    {/if}
</div>

<style>

</style>