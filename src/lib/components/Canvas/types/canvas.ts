import type { Model } from "$lib/types/types";
import type { TypeUser } from "$lib/types/user";
import type { CanvasModes } from "../enums/modes"
import type { TypeInviteLink } from "./inviteLink";
import type { PieceSettings } from "./piece";
import type { PiecesManagerSerialized } from "./piecesManager";
import type { RulerSettings } from "./ruler";
import type { TypeSharedAccess } from "./sharedAccess";

// These canvas data properties do get saved
export type CanvasData = {
    name: string
    backgroundColor: string
    snapToGrid: boolean
    pieceSettings: PieceSettings
    rulerSettings: RulerSettings
    piecesManager?: PiecesManagerSerialized
};

// These canvas data properties are related to a client and do not get saved
export type ClientCanvasData = {
    ctx?: CanvasRenderingContext2D
    width?: number
    height?: number
    activeMode: CanvasModes
    mouseDown: boolean
    mouseX: number
    mouseY: number
    prevMouseX: number
    prevMouseY: number
    xPan: number
    yPan: number
    zoom: number
    zoomDx: number
    zoomDy: number
}

export type Canvas = Model & {
    canvasData: CanvasData & ClientCanvasData
    user?: TypeUser
    canvas_shared_accesses?: Array<TypeSharedAccess>
    canvas_shared_invitations?: Array<TypeInviteLink>
}

export type CanvasWithoutClientCanvasData = Omit<Canvas, "canvasData"> & { canvasData: CanvasData };
