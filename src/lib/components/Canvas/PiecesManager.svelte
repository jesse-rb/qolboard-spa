<script lang="ts">
    import { get, type Writable } from "svelte/store";
    import { createEventDispatcher, getContext, tick } from "svelte";
    import Piece from "./Piece.svelte";
    import type { PiecesManagerSerialized } from "./types/piecesManager";
    import type { Canvas } from "./types/canvas";
    import type { PieceSerialized, TypeBindPiece } from "./types/piece";

    type TypeBoundingBox = {
        topMost: number;
        bottomMost: number;
        rightMost: number;
        leftMost: number;
    };

    const dispatch = createEventDispatcher();

    const canvasStore: Writable<Canvas> = getContext("canvasStore");
    let selectedPiece: TypeBindPiece | undefined = undefined;
    let selectedPieceIndex: number | undefined = undefined;
    let pieces: Array<TypeBindPiece> = [];

    let leftMost: number = 0;
    let rightMost: number = 0;
    let topMost: number = 0;
    let bottomMost: number = 0;

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

    export function deserialize(s: PiecesManagerSerialized) {
        leftMost = s.leftMost;
        rightMost = s.rightMost;
        topMost = s.topMost;
        bottomMost = s.bottomMost;

        for (const serializedPiece of s.pieces) {
            addSerializedPiece(serializedPiece);
        }
    }

    export async function addSerializedPiece(s: PieceSerialized) {
        let p: TypeBindPiece = {
            component: undefined,
        };
        pieces = [...pieces, p];
        await tick();
        p.component?.deserialize(s);
    }

    export function clear() {
        deselect();
        pieces = [];
    }

    export function addPiece(): TypeBindPiece {
        deselect();
        const newPiece: TypeBindPiece = {
            component: undefined,
        };
        pieces = [...pieces, newPiece];

        selectedPiece = newPiece;
        selectedPieceIndex = pieces.length - 1;

        return newPiece;
    }

    export function updatePiece(s: PieceSerialized) {
        const p = pieces[s.index]?.component;

        if (p) {
            p.clearBoundingBox();
            p.deserialize(s);
            redrawPieceChunk(p);
        }
    }

    export function addPointToLatestPiece(): TypeBindPiece {
        const p = pieces[pieces.length - 1];
        if (p.component) {
            p.component.addPoint();
        }

        return p;
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
                if (!redrawPiece && p.component === piece) {
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

    function handlePieceUpdate(p: TypeBindPiece, redrawPiece = true) {
        redrawPieceChunk(p.component, redrawPiece);
        dispatch("update-piece", p);
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
                    $canvasStore.canvas_data.mouseX *
                        $canvasStore.canvas_data.zoom,
                    $canvasStore.canvas_data.mouseY *
                        $canvasStore.canvas_data.zoom,
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

    export function move(): TypeBindPiece | undefined {
        if (selectedPiece?.component) {
            selectedPiece.component.clearBoundingBox();
            selectedPiece.component.move();
            reDrawSelectedChunk();
        }

        return selectedPiece;
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
        return canvasStoreCurrent.canvas_data.pieceSettings;
    }
</script>

<div id="pieces">
    {#each pieces as p, i (p)}
        <Piece
            bind:this={p.component}
            settings={{ ...initialPieceSettings() }}
            index={i}
            on:update={(e) => handlePieceUpdate(p, e.detail)}
            on:updateBoundingBox={(e) => updateBoundingBox(e.detail)}
        />
    {/each}
</div>

<style>
    div#pieces {
        background-color: var(--color-back-2);
    }
</style>
