<script lang="ts">
    export let cursors:Record<string,{x:number, y:number}> = {};
</script>

{#each Object.entries(cursors) as [email, pos]}
    <div class="pointer-events-none fixed" style="left: {pos.x-8}px; top: calc({pos.y-8}px + var(--header-height));">
        <div class="w-4 h-4 rounded-full bg-gray-400"></div>
        <p class="text-xs">{email}</p>
    </div>
{/each}