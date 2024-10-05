<script lang="ts">
    import Button from "../Button.svelte";

    export let email:string;

    let ok:boolean = false;
    let isLoading:boolean = false;
    let errors:Array<string> = [];

    async function resendEmailVerification() {
        isLoading = true;

        const domain = import.meta.env.VITE_API_HOST;
        const path = "auth/resend_verification_email";
        const url = `${domain}/${path}`;
        const body = {
            email: email
        };
        console.log(email);
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(body)
        });

        isLoading = false;
    }
</script>

<Button
    label="Resend"
    onclick={resendEmailVerification}
    icon="refresh"
    bind:isLoading={isLoading}
/>

<style>

</style>