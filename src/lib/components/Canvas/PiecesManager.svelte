<script>
    import { getContext } from "svelte";
    import Piece from "./Piece.svelte";

    const canvasSotre = getContext('canvasStore');
    let selectedPiece = null;
    let pieces = [];
    let pointToPieceMap = {}; // x,y->[p]

    export function addPiece() {
        pieces = [...pieces, {component:null}];
    }

    export function addPointToLatestPiece() {
        if (pieces.length && pieces[pieces.length-1].component) {
            let p = pieces[pieces.length-1].component;
            p.addPoint();
            let k = pointToPieceMapKey();
            pointToPieceMap[k] = p;
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
        }
        // Select new piece
        let k = pointToPieceMapKey();
        if (pointToPieceMap[k]) {
            pointToPieceMap[k].select();
        }
        selectedPiece = pointToPieceMap[k];
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

    function updatePointToPieceMap(pointDetails) {
        delete pointToPieceMap[pointToPieceMapKey(pointDetails.oldX, pointDetails.oldY)];
        pointToPieceMap[pointToPieceMapKey(pointDetails.x, pointDetails.y)] = selectedPiece;
    }

    function pointToPieceMapKey(x=null, y=null) {
        x = x ? x : $canvasSotre.mouseX;
        y = y ? y : $canvasSotre.mouseY;
        return `${x},${y}`;
    }
</script>

{#each pieces as p}
    <Piece bind:this={p.component} on:move={(e)=>updatePointToPieceMap(e.detail)} />
{/each}