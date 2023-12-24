import type { CanvasModes } from "../enums/modes"
import type { PieceSettings } from "./piece";
import type { PiecesManagerSerialized as SerializedPiecesManager } from "./piecesManager";

export type CanvasStore = {
    width: number
    height: number
    activeMode: CanvasModes
    mouseDown: boolean
    mouseX: number
    mouseY: number
    prevMouseX: number
    prevMouseY: number
    xPan: number
    yPan: number
    ctx?: CanvasRenderingContext2D
    backgroundColor: string
    pieceSettings: PieceSettings
    zoom: number
};

export type CanvasSerialized = {
    store: CanvasStore
    piecesManager: SerializedPiecesManager
};