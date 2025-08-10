<script lang="ts">
    import type { Error, ShowResponse } from "$lib/types/types";
    import { appStore, getUser } from "../../store";
    import Button from "../Button.svelte";
    import ResendEmailVerificaitonButton from "./ResendEmailVerificaitonButton.svelte";
    import Errors from "../Form/Errors.svelte";
    import type { TypeUser } from "$lib/types/user";

    type AuthRequestBody = {
        email: string;
        password: string;
        password_confirmation?: string;
    };

    type AuthResponseBody = {
        user: TypeUser;
        code: string;
    };

    export let isRegistration: boolean = false;

    let email = $appStore.registeredEmail ?? "";
    let password = "";
    let passwordConfirmation = "";
    let suggestLogin = false;

    let isLoading = false;

    let errors: Array<Error> = [];

    let ok = isRegistration && $appStore.registeredEmail != null;

    function resetAuthFields() {
        email = "";
        password = "";
        passwordConfirmation = "";
    }

    async function auth() {
        ok = false;
        errors = [];

        isLoading = true;

        const domain = import.meta.env.VITE_API_HOST;
        const path = `auth/${isRegistration ? "register" : "login"}`;
        const url = `${domain}/${path}`;

        const body: AuthRequestBody = {
            email: email,
            password: password,
        };

        if (isRegistration) {
            body.password_confirmation = passwordConfirmation;
        }

        const response = await fetch(url, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify(body),
            headers: {
                "content-type": "application/json",
            },
        });

        const responseBody: ShowResponse<TypeUser> & { code?: string } =
            await response.json();

        if (response.ok) {
            ok = true;
            if (isRegistration) {
                $appStore.registeredEmail = responseBody.data.email;
            } else {
                getUser();
            }
        } else {
            if (responseBody.code == "user_already_exists") {
                suggestLogin = true;
            }
            errors = responseBody.errors ?? [];
        }

        resetAuthFields();

        isLoading = false;
    }

    function backToRegistration() {
        $appStore.registeredEmail = null;
        ok = false;
    }

    function goToLogin() {
        isRegistration = false;
        errors = [];
    }
</script>

<div class="flex flex-col gap-2">
    {#if ok}
        {#if isRegistration}
            <h2>Thank you for registering</h2>
            <p>
                We have sent an email to <em>{$appStore.registeredEmail}</em> with
                instructions to verify your email address.
            </p>
            <Button
                label="Back to registration"
                icon="undo"
                onclick={backToRegistration}
            />
            <ResendEmailVerificaitonButton />
        {/if}
    {:else}
        <div class="flex flex-col">
            <input
                id="email"
                bind:value={email}
                type="email"
                placeholder="Email"
            />
            <input
                id="password"
                bind:value={password}
                type="password"
                placeholder="Password"
            />

            {#if isRegistration}
                <input
                    id="password_confirmation"
                    bind:value={passwordConfirmation}
                    type="password"
                    placeholder="Confirm password"
                />
            {/if}
        </div>

        <Button
            label={isRegistration ? "Register" : "Login"}
            onclick={auth}
            icon="send"
            bind:isLoading
            disabled={isLoading}
        />

        <Errors {errors} />

        {#if isRegistration && suggestLogin}
            <p>
                It looks like your email is already registered with us, please
                login instead
            </p>
            <Button label={"Login instead"} onclick={goToLogin} />
        {/if}
    {/if}
</div>

<style>
</style>
