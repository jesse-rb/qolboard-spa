<script>
    import { get } from "svelte/store";
    import { getContext } from "svelte";
    import Piece from "./Piece.svelte";

    const canvasSotre = getContext('canvasStore');
    let selectedPiece = null;
    let pieces = [];

    export function addPiece() {
        pieces = [...pieces, {component:null}];
    }

    export function addPointToLatestPiece() {
        if (pieces.length && pieces[pieces.length-1].component) {
            let p = pieces[pieces.length-1].component;
            p.addPoint();
        }
    }

    export function draw() {
        for (let i = 0; i < pieces.length; i++) {
            pieces[i].component.draw();
        }
    }

    export function select() {
        console.log('event: selecting piece');
        // Deselect old selected piece
        if (selectedPiece) {
            selectedPiece.deselect();
            selectedPiece = undefined;
        }
        // Select new piece
        for (let i=pieces.length-1; i>0; i--) {
            const piece = pieces[i];
            if (piece.component.isPointInStroke($canvasSotre.mouseX, $canvasSotre.mouseY)) {
                console.log('SELECTED');
                selectedPiece = piece.component;
                selectedPiece.select();
                return;
            }
        }
        
    }

    export function move() {
        if (selectedPiece) {
            console.log('event: moving piece');
            selectedPiece.move();
        }
    }

    export function getSelected() {
        return selectedPiece;
    }

    export function debugLogLatestPiece() {
        if (pieces.length == 0) {
            console.log('no pieces');
            return;
        }

        const latestPiece = pieces[pieces.length-1];
        console.log(latestPiece.component.getPoints());
    }

    function initialPieceSettings() {
        const canvasStoreCurrent = get(canvasSotre);
        return canvasStoreCurrent.pieceSettings;
    }

</script>

<div id="pieces">
    {#each pieces as p}
        <Piece bind:this={p.component} settings={{ ...initialPieceSettings() }} />
    {/each}
</div>

<style>
    div#pieces {
        background-color: var(--color-back-2);
    }
</style>
