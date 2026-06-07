<script lang="ts">
    import type { Error, ShowResponse } from "$lib/types/types";
    import { appStore, getUser } from "../../store";
    import Button from "../Button.svelte";
    import ResendEmailVerificaitonButton from "./ResendEmailVerificaitonButton.svelte";
    import Errors from "../Form/Errors.svelte";
    import type { TypeUser } from "$lib/types/user";

    type AuthRequestBody = {
        email: string;
        otp?: string;
    };

    interface Props {
        isRegistration?: boolean;
    }

    let { isRegistration = $bindable(false) }: Props = $props();

    let email = $state($appStore.registeredEmail ?? "");
    let otp = $state("");
    let suggestLogin = $state(false);
    let showOTP = $state(false);

    let isLoading = $state(false);

    let errors: Array<Error> = $state([]);

    let ok = $state(isRegistration && $appStore.registeredEmail != null);

    function resetAuthFields() {
        email = "";
        otp = "";
    }

    async function auth() {
        ok = false;
        errors = [];

        isLoading = true;

        const domain = import.meta.env.VITE_API_HOST;
        const path = `auth/${isRegistration ? "register" : showOTP ? "login" : "request_otp"}`;
        const url = `${domain}/${path}`;

        const body: AuthRequestBody = {
            email: email,
        };

        if (!isRegistration && showOTP) {
            body.otp = otp;
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
            } else if (showOTP) {
                getUser();
            }

            if (!isRegistration) {
                if (showOTP) {
                    resetAuthFields();
                } else {
                    showOTP = true;
                }
            }
        } else {
            if (response.status == 409) {
                suggestLogin = true;
            }
            errors = responseBody.errors ?? [];
        }

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

<div class="flex flex-col gap-2 max-w-96">
    {#if isRegistration && ok}
        <h2>Thank you for registering</h2>
        <p>
            We have sent an email to <em>{$appStore.registeredEmail}</em> with instructions
            to verify your email address.
        </p>
        <Button
            label="Back to registration"
            icon="undo"
            onclick={backToRegistration}
        />
        <ResendEmailVerificaitonButton />
    {:else}
        <div class="flex flex-col">
            <input
                id="email"
                bind:value={email}
                type="email"
                placeholder="Email"
            />
            {#if !isRegistration && showOTP}
                <input
                    id="otp"
                    bind:value={otp}
                    type="text"
                    placeholder="Temporary Login Code"
                />
            {/if}
        </div>

        {#if !isRegistration && showOTP}
            <p>
                We sent an email to "{email}" containing your OTP login code,
                please enter it here to login.
            </p>
        {/if}

        <Button
            label={isRegistration ? "Register" : showOTP ? "Login" : "Send OTP"}
            onclick={auth}
            icon={isRegistration || showOTP ? "send" : "mark_email_unread"}
            {isLoading}
            disabled={isLoading}
        />

        {#if !isRegistration && !showOTP}
            <p>
                We will send a "one time password" (OTP) login code to your
                email. If you have already requested one, use the button below
                to enter your OTP.
            </p>
            <Button
                label="Already requested OTP"
                onclick={() => {
                    showOTP = true;
                }}
                icon="mark_email_read"
                disabled={isLoading}
            />
        {/if}

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
