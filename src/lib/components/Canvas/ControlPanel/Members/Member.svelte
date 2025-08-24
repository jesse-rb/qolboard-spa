<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import { request } from "$lib/http";
    import { createEventDispatcher, getContext } from "svelte";
    import type { TypeSharedAccess } from "../../types/sharedAccess";
    import { appStore } from "$lib/store";
    import IfCanvasOwner from "../../IfCanvasOwner.svelte";
    import type { Writable } from "svelte/store";
    import type { Canvas } from "../../types/canvas";

    export let data: TypeSharedAccess;

    const dispatch = createEventDispatcher();
    const canvasStore: Writable<Canvas> = getContext("canvasStore");
    const isSelf = data.user?.uuid === $appStore.user.uuid;
    const isCanvasOwner = $canvasStore.user?.uuid == $appStore.user.uuid;
    let deleteIsLoading = false;

    function dispatchDeleted() {
        dispatch("deleted");
    }

    async function deleteMember() {
        deleteIsLoading = true;
        const path = `user/canvas/shared_access/${data.id}`;

        const response = await request("DELETE", path);

        if (response.ok) {
            dispatchDeleted();
        }

        deleteIsLoading = false;
    }
</script>

<div class="w-full flex gap-1">
    {#if isCanvasOwner}
        <Button
            icon="person_remove"
            onclick={deleteMember}
            isLoading={deleteIsLoading}
        />
    {:else if isSelf}
        <Button
            icon="person_remove"
            onclick={deleteMember}
            isLoading={deleteIsLoading}
        />
    {:else}
        <span class="material-icons p-[10px]">person</span>
    {/if}
    <span class="bg-back_2 rounded-md p-2 h-full">
        {data.user?.email ?? "Unkown"}
        {isSelf ? "(me)" : ""}
    </span>
</div>
