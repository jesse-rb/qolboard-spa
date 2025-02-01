<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import { getContext, onMount } from "svelte";
    import type { Writable } from "svelte/store";
    import InviteLink from "./InviteLink.svelte";
    import type { ShowResponse } from "$lib/types/types";
    import type { TypeInviteLink } from "../../types/inviteLink";
    import { removeFromArrayByIndex } from "$lib/util";
    import type { Canvas } from "../../types/canvas";

    export let isExpanded;
    let createIsLoading = false;

    const canvasStore: Writable<Canvas> = getContext("canvasStore");
    const domain = import.meta.env.VITE_API_HOST;
    const canvasId = $canvasStore.id;

    onMount(() => {});

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
            $canvasStore.canvas_shared_invitations = [
                ...($canvasStore.canvas_shared_invitations ?? []),
                body.data,
            ];
        }

        createIsLoading = false;
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

    {#if ($canvasStore.canvas_shared_invitations ?? []).length > 0}
        {#each $canvasStore.canvas_shared_invitations ?? [] as d, i}
            <InviteLink
                data={d}
                on:deleted={() =>
                    ($canvasStore.canvas_shared_invitations =
                        removeFromArrayByIndex(
                            $canvasStore.canvas_shared_invitations ?? [],
                            i,
                        ))}
            />
        {/each}
    {:else}
        <p>No invite links</p>
    {/if}
</div>
