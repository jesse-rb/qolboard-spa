<script>
    const isDev = import.meta.env.DEV;
</script>

{#if isDev}
    <div class="dev-only">
        <slot></slot>
    </div>
{/if}

<style>
    .dev-only {
        display: flex;
        flex-direction: column;
        color: lightcoral;
    }
</style>