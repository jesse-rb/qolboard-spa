<script lang="ts">
    import { createEventDispatcher, getContext } from "svelte";
    import Button from "$lib/components/Button.svelte";
    import type { TypeInviteLink } from "../../types/inviteLink";
    import { request } from "$lib/http";
    import IfCanvasOwner from "../../IfCanvasOwner.svelte";

    export let data: TypeInviteLink;
    let deleteIsLoading = false;

    const dispatch = createEventDispatcher();

    function dispatchDeleted() {
        dispatch("deleted");
    }

    function copyLinkToClipboard() {
        navigator.clipboard.writeText(data.link);
        alert("Copied to clipboard!");
    }

    async function deleteInviteLink() {
        deleteIsLoading = true;
        const path = `user/canvas/shared_invitation/${data.id}`;

        const response = await request("DELETE", path);

        if (response.ok) {
            dispatchDeleted();
        }

        deleteIsLoading = false;
    }
</script>

<div class="w-full">
    <pre class="overflow-x-auto">{data.link}</pre>
    <div class="pt-1">
        <Button icon="content_copy" onclick={copyLinkToClipboard} />
        <IfCanvasOwner>
            <Button
                icon="delete"
                onclick={deleteInviteLink}
                isLoading={deleteIsLoading}
            />
        </IfCanvasOwner>
    </div>
</div>
