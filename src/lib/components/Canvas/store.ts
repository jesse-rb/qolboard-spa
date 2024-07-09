import { writable, type Writable } from "svelte/store";
import { CanvasModes } from "./enums/modes";
import type { CanvasStore } from "./types/canvas";

/**
 * The store for a canvas
 */
export const store:Writable<CanvasStore> = writable({
    id: null,
    width: 0,
    height: 0,
    activeMode:CanvasModes.Draw,
    mouseDown:false,
    mouseX:0,
    mouseY:0,
    prevMouseX:0,
    prevMouseY:0,
    xPan: 0,
    yPan: 0,
    ctx: null,
    backgroundColor: '#1A1A1A',
    snapToGrid: false,
    pieceSettings: {
        size: 20,
        color: '#D55C1A'
    },
    rulerSettings: {
        showUnits: true,
        showLines: false,
    },
    zoom: 1,
    zoomDx: 0,
    zoomDy: 0
});
