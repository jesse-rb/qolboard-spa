<script lang="ts">
    import { get, type Writable } from "svelte/store";
    import { getContext, tick } from "svelte";
    import Piece from "./Piece.svelte";
    import type { PiecesManagerSerialized } from "./types/piecesManager";
    import type { Canvas } from "./types/canvas";
    import type { PieceSerialized } from "./types/piece";

    type TypeBoundingBox = {
        topMost: number;
        bottomMost: number;
        rightMost: number;
        leftMost: number;
    };

    interface Props {
        updatedPiece: Function;
        removedPiece: Function;
    }

    let { updatedPiece, removedPiece }: Props = $props();

    const canvasStore: Writable<Canvas> = getContext("canvasStore");
    let selectedPieceIndex: number | undefined = $state(undefined);
    let pieces: Array<number> = $state([]);
    let pieceRefs: Array<Piece> = $state([]);

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

        for (const p of pieceRefs) {
            if (p) {
                const serializedPiece = p.serialize();
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

        pieces = s.pieces.map(() => 0);

        tick().then(() => {
            s.pieces.forEach((serialized, i) => {
                pieceRefs[i]?.deserialize(serialized);
            });
        });
    }

    export function addSerializedPiece(s: PieceSerialized) {
        pieces = [...pieces, 0];

        const index = pieces.length - 1;
        tick().then(() => {
            pieceRefs[index]?.deserialize(s);
        });
    }

    export function clear() {
        deselect();
        pieces = [];
        pieceRefs = [];
    }

    export function addPiece(): number {
        deselect();

        pieces = [...pieces, 0];

        const index = pieces.length - 1;
        return index;
    }

    export function updatePiece(s: PieceSerialized) {
        const p = pieceRefs[s.index];

        if (p) {
            p.clearBoundingBox();
            p.deserialize(s);
            redrawPieceChunk(p);
        }
    }

    export function removePiece(s: PieceSerialized) {
        const p = pieceRefs[s.index];

        if (p) {
            redrawPieceChunk(p, false);
            remove(s.index);
        }
    }
    export function addPointToLatestPiece(): Piece {
        const p = pieceRefs[pieceRefs.length - 1];
        if (p) {
            p.addPoint();
        }

        return p;
    }

    export function draw() {
        for (let i = 0; i < pieceRefs.length; i++) {
            pieceRefs[i] && pieceRefs[i].draw();
        }
    }

    export function redrawPieceChunk(piece?: Piece, redrawPiece = true) {
        piece?.clearBoundingBox();
        // Only redraw pieces that are inbound of section
        for (const p of pieceRefs) {
            if (p) {
                if (!redrawPiece && p === piece) {
                    continue;
                }
                if (piece?.doesBoundingBoxOverlap(p.getBoundingBox())) {
                    p?.draw();
                }
            }
        }
    }

    function handlePieceUpdate(i: number, redrawPiece = true) {
        const p = pieceRefs[i];
        redrawPieceChunk(p, redrawPiece);
        updatedPiece(p);
    }

    export function getSelectedPiece(): Piece | undefined {
        if (selectedPieceIndex !== undefined && pieceRefs[selectedPieceIndex]) {
            return pieceRefs[selectedPieceIndex];
        }
        return undefined;
    }

    export function getPiece(i: number): Piece | undefined {
        const p = pieceRefs[i];
        if (p) {
            return p;
        }
        return undefined;
    }

    export function reDrawSelectedChunk(redrawPiece = true) {
        // Draw only section background
        const p = getSelectedPiece();
        if (p) {
            redrawPieceChunk(p, redrawPiece);
        }
    }

    export function deselect() {
        // Deselect old selected piece
        const p = getSelectedPiece();
        if (p) {
            p.deselect();
            reDrawSelectedChunk();
        }
        selectedPieceIndex = undefined;
    }

    export function select() {
        deselect();

        // Select new piece
        for (let i = 0; i <= pieceRefs.length; i++) {
            const p = pieceRefs[i];
            if (
                p?.isPointInStroke(
                    $canvasStore.canvas_data.mouseX *
                        $canvasStore.canvas_data.zoom,
                    $canvasStore.canvas_data.mouseY *
                        $canvasStore.canvas_data.zoom,
                )
            ) {
                selectedPieceIndex = i;

                reDrawSelectedChunk();
                return;
            }
        }
    }

    export function pan(dx?: number, dy?: number) {
        for (const p of pieceRefs) {
            p?.move(true, dx, dy);
        }
    }

    export function move(): Piece | undefined {
        const p = getSelectedPiece();
        if (p) {
            p.clearBoundingBox();
            p.move();
            reDrawSelectedChunk();
        }

        return p;
    }

    export function remove(index: number) {
        pieces.splice(index, 1);
        pieceRefs.splice(index, 1);

        if (selectedPieceIndex !== undefined) {
            if (selectedPieceIndex === index) {
                selectedPieceIndex = undefined;
            } else if (selectedPieceIndex > index) {
                selectedPieceIndex--;
            }
        }
    }

    export function removeSelected() {
        if (selectedPieceIndex !== undefined) {
            const p = getSelectedPiece();
            if (p) {
                const s = p.serialize();
                reDrawSelectedChunk(false);
                remove(selectedPieceIndex);

                deselect();

                removedPiece(s);
            }
        }
    }

    function initialPieceSettings() {
        const canvasStoreCurrent = get(canvasStore);
        return canvasStoreCurrent.canvas_data.pieceSettings;
    }
</script>

<div id="pieces">
    {#each pieces as _, i (i)}
        <Piece
            selected={i === selectedPieceIndex}
            bind:this={pieceRefs[i]}
            settings={{ ...initialPieceSettings() }}
            index={i}
            updated={(v: boolean) => handlePieceUpdate(i, v)}
            updatedBoundingBox={(v: TypeBoundingBox) => updateBoundingBox(v)}
        />
    {/each}
</div>

<style>
    div#pieces {
        background-color: var(--color-back-2);
    }
</style>
