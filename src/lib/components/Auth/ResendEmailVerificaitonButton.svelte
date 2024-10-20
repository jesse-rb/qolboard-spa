<script lang="ts">
    import { appStore } from "$lib/store";
    import type { Error } from "$lib/types";
    import Button from "../Button.svelte";
    import Errors from "../Form/Errors.svelte";

    let ok:boolean = false;
    let isLoading:boolean = false;
    let errors:Array<Error> = [];

    async function resendEmailVerification() {
        ok = false;
        isLoading = true;

        const domain = import.meta.env.VITE_API_HOST;
        const path = "auth/resend_verification_email";
        const url = `${domain}/${path}`;
        const body = {
            email: $appStore.registeredEmail
        };
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(body)
        });

        const responseBody = await response.json();

        if (response.ok) {
            ok = true;
        }
        else {
            errors = responseBody.errors ?? [];
        }

        isLoading = false;
    }
</script>

<Button
    label="Resend"
    onclick={resendEmailVerification}
    icon="refresh"
    bind:isLoading={isLoading}
/>
<Errors errors={errors} />

<style>

</style>