<script lang="ts">
    import { browser } from "$app/environment";
    import { appStore } from "$lib/store";
    interface Props {
        children?: import("svelte").Snippet;
    }

    let { children }: Props = $props();

    $effect.pre(() => {
        if (!$appStore.isAuthenticated) {
            if (browser) {
                window.location.assign("/");
            }
        }
    });
</script>

{@render children?.()}

