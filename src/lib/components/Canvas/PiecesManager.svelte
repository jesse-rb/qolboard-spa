<script lang="ts">
    import { get, type Writable } from "svelte/store";
    import { getContext, tick } from "svelte";
    import Piece from "./Piece.svelte";
    import type { PiecesManagerSerialized } from "./types/piecesManager";
    import type { Canvas } from "./types/canvas";

    type TypeBoundingBox = {
        topMost: number;
        bottomMost: number;
        rightMost: number;
        leftMost: number;
    };

    type TypeBindPiece = {
        component?: Piece;
    };

    const canvasStore: Writable<Canvas> = getContext("canvasStore");
    let selectedPiece: TypeBindPiece | undefined = undefined;
    let selectedPieceIndex: number | undefined = undefined;
    let pieces: Array<TypeBindPiece> = [];

    let leftMost: number;
    let rightMost: number;
    let topMost: number;
    let bottomMost: number;

    function updateBoundingBox(box: TypeBoundingBox) {
        topMost = topMost < box.topMost ? topMost : box.topMost;
        rightMost = rightMost > box.rightMost ? rightMost : box.rightMost;
        bottomMost = bottomMost > box.bottomMost ? bottomMost : box.bottomMost;
        leftMost = leftMost < box.leftMost ? leftMost : box.leftMost;
    }

    export function serialize(): PiecesManagerSerialized {
        const s: PiecesManagerSerialized = {
            pieces: [],
            leftMost: leftMost,
            rightMost: rightMost,
            topMost: topMost,
            bottomMost: bottomMost,
        };

        for (const p of pieces) {
            if (p.component) {
                const serializedPiece = p.component.serialize();
                s.pieces.push(serializedPiece);
            }
        }
        return s;
    }

    export async function deserialize(s: PiecesManagerSerialized) {
        leftMost = s.leftMost;
        rightMost = s.rightMost;
        topMost = s.topMost;
        bottomMost = s.bottomMost;

        for (const serializedPiece of s.pieces) {
            let p: TypeBindPiece = {
                component: undefined,
            };
            pieces = [...pieces, p];
            await tick();
            p.component?.deserialize(serializedPiece);
        }
    }

    export function clear() {
        deselect();
        pieces = [];
    }

    export function addPiece() {
        deselect();
        const newPiece: TypeBindPiece = {
            component: undefined,
        };
        pieces = [...pieces, newPiece];

        selectedPiece = newPiece;
        selectedPieceIndex = pieces.length - 1;
    }

    export function addPointToLatestPiece() {
        if (pieces.length && pieces[pieces.length - 1]) {
            pieces[pieces.length - 1].component?.addPoint();
        }
    }

    export function draw() {
        for (let i = 0; i < pieces.length; i++) {
            pieces[i] && pieces[i].component?.draw();
        }
    }

    export function redrawPieceChunk(piece?: Piece, redrawPiece = true) {
        piece?.clearBoundingBox();
        // Only redraw pieces that are inbound of section
        for (const p of pieces) {
            if (p.component) {
                if (!redrawPiece && p === piece) {
                    continue;
                }
                if (
                    piece?.doesBoundingBoxOverlap(p.component.getBoundingBox())
                ) {
                    p.component?.draw();
                }
            }
        }
    }

    export function reDrawSelectedChunk() {
        // Draw only section background
        if (selectedPiece) {
            redrawPieceChunk(selectedPiece.component);
        }
    }

    export function deselect() {
        // Deselect old selected piece
        if (selectedPiece?.component) {
            selectedPiece.component.deselect();
            reDrawSelectedChunk();
        }
        selectedPiece = undefined;
        selectedPieceIndex = undefined;
    }

    export function select() {
        deselect();
        // Select new piece
        for (let i = pieces.length - 1; i >= 0; i--) {
            const piece = pieces[i];
            if (
                piece.component?.isPointInStroke(
                    $canvasStore.canvasData.mouseX *
                        $canvasStore.canvasData.zoom,
                    $canvasStore.canvasData.mouseY *
                        $canvasStore.canvasData.zoom,
                )
            ) {
                console.log("SELECTED");
                selectedPiece = piece;
                selectedPieceIndex = i;
                selectedPiece.component?.select();

                reDrawSelectedChunk();
                return;
            }
        }
    }

    export function pan(dx?: number, dy?: number) {
        for (const p of pieces) {
            p.component?.move(true, dx, dy);
        }
    }

    export function move() {
        if (selectedPiece?.component) {
            selectedPiece.component.clearBoundingBox();
            selectedPiece.component.move();
            reDrawSelectedChunk();
        }
    }

    export function remove() {
        if (selectedPieceIndex !== undefined) {
            pieces = [
                ...pieces.slice(0, selectedPieceIndex),
                ...pieces.slice(selectedPieceIndex + 1),
            ];

            reDrawSelectedChunk();
            deselect();
        }
    }

    export function getSelected() {
        return selectedPiece;
    }

    export function debugLogLatestPiece() {
        if (pieces.length == 0) {
            console.log("no pieces");
            return;
        }

        const latestPiece = pieces[pieces.length - 1];
        console.log(latestPiece.component?.getPoints());
    }

    function initialPieceSettings() {
        const canvasStoreCurrent = get(canvasStore);
        return canvasStoreCurrent.canvasData.pieceSettings;
    }
</script>

<div id="pieces">
    {#each pieces as p (p)}
        <Piece
            bind:this={p.component}
            settings={{ ...initialPieceSettings() }}
            on:update={(e) => redrawPieceChunk(p.component, e.detail)}
            on:updateBoundingBox={(e) => updateBoundingBox(e.detail)}
        />
    {/each}
</div>

<style>
    div#pieces {
        background-color: var(--color-back-2);
    }
</style>
