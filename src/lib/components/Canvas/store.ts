import { writable, type Writable } from "svelte/store";
import { CanvasModes } from "./enums/modes";
import type { CanvasStore as StoreTypeDef } from "./types/canvas";

/**
 * The store for a canvas
 */
export const store:Writable<StoreTypeDef> = writable({
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
    ctx: undefined,
    backgroundColor: '#1A1A1A',
    pieceSettings: {},
    zoom: 1
});