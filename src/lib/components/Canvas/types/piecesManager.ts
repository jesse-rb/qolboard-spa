import type { Serialized as SerializedPiece } from "./piece";

export type Serialized = {
    pieces: Array<SerializedPiece>
    leftMost: number
    rightMost: number
    topMost: number
    bottomMost: number
};