<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import { getContext, onMount } from "svelte";
    import type { Writable } from "svelte/store";
    import type { CanvasStore } from "../../types/canvas";
    import InviteLink from "./InviteLink.svelte";
    import type { IndexResponse, ShowResponse } from "$lib/types";
    import type { TypeInviteLink } from "../../types/inviteLink";
    import { removeFromArrayByIndex } from "$lib/util";

    export let isExpanded;
    let createIsLoading = false;
    let indexIsLoading = false;
    let indexPage = 0;
    let indexLimit = 5;

    let inviteLinks: Array<TypeInviteLink> = [];

    const canvasStore: Writable<CanvasStore> = getContext("canvasStore");
    const domain = import.meta.env.VITE_API_HOST;
    const canvasId = $canvasStore.id;

    onMount(() => {
        index();
    });

    async function create() {
        createIsLoading = true;

        const path = `user/canvas/${canvasId}/shared_invitation`;
        const url = `${domain}/${path}`;

        const response = await fetch(url, {
            method: "POST",
            credentials: "include",
            headers: {
                "content-type": "application/json",
            },
        });
        const body: ShowResponse<TypeInviteLink> = await response.json();

        if (response.ok) {
            inviteLinks = [...inviteLinks, body.data];
        }

        createIsLoading = false;
    }

    async function index() {
        indexIsLoading = true;

        const path = `user/canvas/shared_invitation?canvas_id=${canvasId}&page=${indexPage}&limit=${indexLimit}`;
        const url = `${domain}/${path}`;

        const response = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: {
                "content-type": "application/json",
            },
        });
        const body: IndexResponse<TypeInviteLink> = await response.json();

        if (response.ok) {
            inviteLinks = [...inviteLinks, ...body.data];
        }

        indexPage += 1;

        indexIsLoading = false;
    }
</script>

<div class="control-group">
    <h1 class:hidden={!isExpanded}>Invites</h1>

    <Button
        icon="share"
        label={isExpanded ? "Create invite link" : ""}
        onclick={create}
        isLoading={createIsLoading}
    />

    {#if inviteLinks.length > 0}
        {#each inviteLinks as d, i}
            <InviteLink
                data={d}
                on:deleted={() =>
                    (inviteLinks = removeFromArrayByIndex(inviteLinks, i))}
            />
        {/each}
    {:else}
        <p>No invite links</p>
    {/if}
</div>
