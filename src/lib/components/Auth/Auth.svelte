<script lang="ts">
    import type { Error } from "$lib/types";
    import { teleport } from "$lib/util";
    import { onMount } from "svelte";
    import { appStore } from "../../store";
    import Button from "../Button.svelte";
    import ResendEmailVerificaitonButton from "./ResendEmailVerificaitonButton.svelte";

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

    let email = $appStore.registeredEmail ?? '';
    let password = '';
    let passwordConfirmation = '';

    let isLoading = false;
    
    let errors:Array<Error> = [];

    let ok = isRegistration && $appStore.registeredEmail != null;

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
                $appStore.registeredEmail = email;
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

    function backToRegistration() {
        $appStore.registeredEmail = null;
        ok = false;
    }
</script>

<div>
    {#if ok}
        {#if isRegistration}
            <h2>Thank you for registering</h2>
            <p>We have sent an email to <em>{email}</em> with instructions to verify your email address.</p>
            <Button
                label="Back to registration"
                icon="undo"
                onclick={backToRegistration}
            />
            <ResendEmailVerificaitonButton
                email={email}
            />
        {:else}
            <p>Nice, ready to go!</p>
        {/if}
    {:else}
        <div class="flex flex-col">
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

        {#if errors.length > 0}
            {#each errors as error (error.field)}
                <p use:teleport="{{id:error.field}}" class="text-red-400 text-sm">{error.message}</p>
            {/each}
        {/if}
    {/if}
</div>

<style>

</style>