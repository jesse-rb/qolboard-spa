import type { PieceSerialized as SerializedPiece } from "./piece";

export type PiecesManagerSerialized = {
    pieces: Array<SerializedPiece>
    leftMost: number
    rightMost: number
    topMost: number
    bottomMost: number
};