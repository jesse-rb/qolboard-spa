import type { Model } from "$lib/types/types";
import type { TypeUser } from "$lib/types/user";
import type { CanvasModes } from "../enums/modes"
import type { TypeInviteLink } from "./inviteLink";
import type { PieceSettings } from "./piece";
import type { PiecesManagerSerialized } from "./piecesManager";
import type { RulerSettings } from "./ruler";
import type { TypeSharedAccess } from "./sharedAccess";

export type CanvasData = {
    ctx?: CanvasRenderingContext2D
    width?: number
    height?: number
    name: string
    activeMode: CanvasModes
    mouseDown: boolean
    mouseX: number
    mouseY: number
    prevMouseX: number
    prevMouseY: number
    xPan: number
    yPan: number
    backgroundColor: string
    snapToGrid: boolean
    pieceSettings: PieceSettings
    rulerSettings: RulerSettings
    zoom: number
    zoomDx: number
    zoomDy: number
    piecesManager?: PiecesManagerSerialized
};

export type Canvas = Model & {
    canvasData: CanvasData
    user?: TypeUser
    canvas_shared_accesses?: Array<TypeSharedAccess>
    canvas_shared_invitations?: Array<TypeInviteLink>
}
