<script lang="ts">
    import type { Error } from "$lib/types";
    import { teleport } from "$lib/util";

    export let errors:Array<Error> = [];
</script>

{#if errors.length > 0}
    {#each errors as error (error.field)}
        <p use:teleport="{{id:error.field}}" class="text-red-400 text-sm">{error.message}</p>
    {/each}
{/if}