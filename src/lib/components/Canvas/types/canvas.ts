import type { Model } from "$lib/types";
import type { CanvasModes } from "../enums/modes"
import type { PieceSettings } from "./piece";
import type { PiecesManagerSerialized as SerializedPiecesManager } from "./piecesManager";
import type { RulerSettings } from "./ruler";

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
    ctx: null|CanvasRenderingContext2D
    backgroundColor: string
    snapToGrid: boolean
    pieceSettings: PieceSettings
    rulerSettings: RulerSettings
    zoom: number
    zoomDx: number
    zoomDy: number
}

export type CanvasData = Omit<CanvasStore, "ctx"> & {
    piecesManager: SerializedPiecesManager
};

export type Canvas = Model & {
    userEmail: string
    canvasData: CanvasData
}
