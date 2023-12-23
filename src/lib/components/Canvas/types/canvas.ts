import type { Modes } from "../enums/modes"
import type { Serialized as SerializedPiecesManager } from "./piecesManager";

export type Store = {
    width: number
    height: number
    activeMode: Modes
    mouseDown: boolean
    mouseX: number
    mouseY: number
    prevMouseX: number
    prevMouseY: number
    xPan: number
    yPan: number
    ctx?: CanvasRenderingContext2D
    backgroundColor: string
    pieceSettings: object // TODO
    zoom: number
};

export type Serialized = {
    store: Store
    piecesManager: SerializedPiecesManager
};