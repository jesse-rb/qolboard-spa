<script>
    import { browser } from "$app/environment";
    import { appStore } from "$lib/store";

    $: if (!$appStore.isAuthenticated) {
        if (browser) {
            window.location.assign("/");
        }
    }
</script>

<slot></slot>