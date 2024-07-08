import type { CanvasModes } from "../enums/modes"
import type { PieceSettings } from "./piece";
import type { PiecesManagerSerialized as SerializedPiecesManager } from "./piecesManager";
import type { RulerSettings } from "./ruler";

export type CanvasStore = {
    id: number|null
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
    ctx: null|CanvasRenderingContext2D
    backgroundColor: string
    showRuler: boolean
    showGrid: boolean
    snapToGrid: boolean
    pieceSettings: PieceSettings
    rulerSettings: RulerSettings
    zoom: number
    zoomDx: number
    zoomDy: number
}

export type CanvasSerialized = Omit<CanvasStore, "ctx"> & {
    piecesManager: SerializedPiecesManager
};
