<script lang="ts">
    import { appStore } from "../../store";
    import Button from "../Button.svelte";

    type AuthRequestBody = {
        email:string
        password:string
        passwordConfirmation?:string
    };

    type AuthResponseBody = {
        email:string
    };

    export let isRegistration:boolean = false;

    let email = '';
    let password = '';
    let passwordConfirmation = '';

    function resetAuthFields() {
        email = '';
        password = '';
        passwordConfirmation = '';
    }

    async function auth() {
        const domain = import.meta.env.VITE_API_HOST;
        const path = `auth/${isRegistration ? "register" : "login"}`;
        const url = `${domain}/${path}`;

        const body:AuthRequestBody = {
            email: email,
            password: password
        };

        if (isRegistration) {
            body.passwordConfirmation = passwordConfirmation
        }

        const response = await fetch(url, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify(body),
            headers: {
                "content-type": "application/json"
            }
        });

        if (response.ok) {
            const responseBody:AuthResponseBody = await response.json();
            $appStore.isAuthenticated = true;
            $appStore.email = responseBody.email;
        }

        resetAuthFields();
    }
</script>

<div>
    <div class="flex flex-col">
        <input bind:value={email} type="email" placeholder="Email">
        <input bind:value={password} type="password" placeholder="Password">

        {#if isRegistration}
            <input bind:value={passwordConfirmation} type="password" placeholder="Confirm password">
        {/if}
    </div>

    <Button
        label="{isRegistration ? "Register" : "Login"}"
        onclick={auth}
    />
</div>

<style>

</style>