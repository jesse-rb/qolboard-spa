<script>
    import { getContext } from "svelte";
    import Piece from "./Piece.svelte";

    let pieces = [];

    export function addPiece() {
        pieces = [...pieces, {}];
    }
</script>

{#each pieces as p}
    <Piece />
{/each}