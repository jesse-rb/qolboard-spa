<script lang="ts">
    import { page } from "$app/state";
    import Button from "$lib/components/Button.svelte";

    let status = page.url.searchParams.get("status") || "500";
</script>

<div>
    <div
        class="text-4xl absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    >
        <h1>
            error code <em>{status}</em>.
        </h1>
        <p>
            Please reach out for support with the error code, or try again
            later.
        </p>
        <Button
            onclick={() => {
                history.back();
            }}
            label="Go back"
            icon="keyboard_backspace"
        />
    </div>
</div>
