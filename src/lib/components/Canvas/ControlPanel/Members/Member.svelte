<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import type { TypeSharedAccess } from "../../types/sharedAccess";

    export let data: TypeSharedAccess;
</script>

<div class="w-full flex gap-1">
    <span class="bg-back_2 rounded-md p-2 h-full">
        {data.user?.email ?? "Unkown"}
    </span>
    <Button icon="person_remove" />
</div>
