<script lang="ts">
    import { run } from 'svelte/legacy';

    import { browser } from "$app/environment";
    import { appStore } from "$lib/store";
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();

    run(() => {
        if (!$appStore.isAuthenticated) {
            if (browser) {
                window.location.assign("/");
            }
        }
    });
</script>

{@render children?.()}