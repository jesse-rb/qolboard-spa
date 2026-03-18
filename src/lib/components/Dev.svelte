<script lang="ts">
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();
    const isDev = import.meta.env.DEV;
</script>

{#if isDev}
    <div class="dev-only">
        {@render children?.()}
    </div>
{/if}

<style>
    .dev-only {
        display: flex;
        flex-direction: column;
        color: lightcoral;
    }
</style>