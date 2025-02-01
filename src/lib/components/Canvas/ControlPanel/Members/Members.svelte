<script lang="ts">
    import { getContext, onMount } from "svelte";
    import type { Writable } from "svelte/store";
    import type { CanvasDataCleint } from "../../types/canvas";
    import { request } from "$lib/http";
    import type { TypeSharedAccess } from "../../types/sharedAccess.ts";
    import type { IndexResponse } from "$lib/types/types";
    import Member from "./Member.svelte";

    export let isExpanded;

    let indexIsLoading = false;
    let members: Array<TypeSharedAccess> = [];
    CanvasDataCleint;
    const canvasStore: Writable<CanvasStore> = getContext("canvasStore");
    const canvasId = $canvasStore.id;

    onMount(() => {
        index();
    });

    async function index() {
        indexIsLoading = true;

        const path = `user/canvas/shared_access?canvas_id=${canvasId}&with=user`;
        const response = await request("GET", path);
        const responseBody: IndexResponse<TypeSharedAccess> =
            await response.json();
        if (response.ok) {
            members = [...members, ...responseBody.data];
        }

        indexIsLoading = false;
    }
</script>

<div class="control-group">
    <h1 class:hidden={!isExpanded}>Members</h1>

    {#each members as d}
        <Member data={d} />
    {/each}
</div>
