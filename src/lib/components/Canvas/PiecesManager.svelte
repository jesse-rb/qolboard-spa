<script>
    import { get } from "svelte/store";
    import { getContext } from "svelte";
    import Piece from "./Piece.svelte";

    const canvasSotre = getContext('canvasStore');
    let selectedPiece = null;
    let selectedPieceIndex = null;
    let pieces = [];

    export function addPiece() {
        deselect();
        const newPiece = {component:null};
        pieces = [...pieces, newPiece];
        
        selectedPiece = newPiece;
        selectedPieceIndex = pieces.length-1;
    }

    export function addPointToLatestPiece() {
        if (pieces.length && pieces[pieces.length-1].component) {
            let p = pieces[pieces.length-1].component;
            p.addPoint();
            // p.select();

            // reDrawSelectedChunk();
        }
    }

    export function draw() {
        for (let i = 0; i < pieces.length; i++) {
            pieces[i].component.draw();
        }
    }

    export function reDrawSelectedChunk() {
        // Draw only section background
        if (selectedPiece) {
            selectedPiece.component.clearBoundingBox();

            // Only redraw pieces that are inbound of section
            for (const p of pieces) {
                if (selectedPiece.component.doesBoundingBoxOverlap(p.component)) {
                    p.component.draw();
                }
            }
        }
    }

    export function deselect() {
        // Deselect old selected piece
        if (selectedPiece) {
            selectedPiece.component.deselect();
            reDrawSelectedChunk();
        }
        selectedPiece = null;
        selectedPieceIndex = null;
    }

    export function select() {
        console.log('event: selecting piece');
        deselect();
        // Select new piece
        for (let i=pieces.length-1; i>=0; i--) {
            const piece = pieces[i];
            if (piece.component.isPointInStroke($canvasSotre.mouseX, $canvasSotre.mouseY)) {
                console.log('SELECTED');
                selectedPiece = piece;
                selectedPieceIndex = i;
                selectedPiece.component.select();

                reDrawSelectedChunk();
                return;
            }
        }
    }

    export function move() {
        if (selectedPiece) {
            console.log('event: moving piece');
            
            selectedPiece.component.clearBoundingBox();
            selectedPiece.component.move();
            reDrawSelectedChunk();
        }
    }

    export function remove() {
        if (selectedPieceIndex !== null) {
            console.log('event: deleting selected peiece');

            pieces = [ ...pieces.slice(0, selectedPieceIndex), ...pieces.slice(selectedPieceIndex+1) ];

            reDrawSelectedChunk();
            deselect();
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
    {#each pieces as p (p)}
        <Piece bind:this={p.component} settings={{ ...initialPieceSettings() }} />
    {/each}
</div>

<style>
    div#pieces {
        background-color: var(--color-back-2);
    }
</style>
