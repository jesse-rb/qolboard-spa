<script>
    import { getContext, tick } from "svelte";
    import Piece from "./Piece.svelte";

    const canvasSotre = getContext('canvasStore');
    let pieces = [];

    // $: console.log(pieces);

    export function addPiece() {
        pieces = [...pieces, {component:null}];
    }

    export function addPointToLatestPiece() {
        if (pieces.length && pieces[pieces.length-1].component) {
            pieces[pieces.length-1].component.addPoint();
        }
    }

    export function draw() {
        for (let i = 0; i < pieces.length; i++) {
            pieces[i].component.draw();
        }
    }

    export function debugLogLatestPiece() {
        if (pieces.length == 0) {
            console.log('no pieces');
            return;
        }

        const latestPiece = pieces[pieces.length-1];
        console.log(latestPiece.component.getPoints());
    }
</script>

{#each pieces as p}
    <Piece bind:this={p.component} />
{/each}