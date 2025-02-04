import type Piece from "../Piece.svelte";

export type PieceSettings = {
    size: number
    color: string
};

export type PieceSerialized = {
    settings: PieceSettings
    path: string
    move: string
    leftMost: number
    rightMost: number
    topMost: number
    bottomMost: number
    index: number
};

export type TypeBindPiece = {
    component?: Piece;
};
