<script lang="ts">
    import { createEventDispatcher, getContext, tick } from "svelte";
    import type { PieceSerialized, PieceSettings } from "./types/piece";
    import type { Writable } from "svelte/store";
    import type { Canvas } from "./types/canvas";

    export let settings: PieceSettings = {
        color: "#FFFFFF",
        size: 0,
    };
    export let selected = false;
    export let index: number;

    const canvasStore: Writable<Canvas> = getContext("canvasStore");

    const dispatch = createEventDispatcher();
    const ctx = $canvasStore.canvas_data.ctx;

    let pathSVG = "";
    let moveMatrix = new DOMMatrix();
    let panMatrix = new DOMMatrix();
    let path = new Path2D();

    let latestPointX = $canvasStore.canvas_data.mouseX;
    let latestPointY = $canvasStore.canvas_data.mouseY;

    let leftMost: number;
    let rightMost: number;
    let topMost: number;
    let bottomMost: number;

    function dispatchUpdate(redrawPiece: boolean) {
        dispatch("update", redrawPiece);
    }

    function dispatchUpdateBoundingBox() {
        const box = {
            topMost,
            rightMost,
            bottomMost,
            leftMost,
        };
        dispatch("updateBoundingBox", box);
    }

    function setDrawSettings(reset = false) {
        if (ctx) {
            ctx.lineCap = reset ? "butt" : "round";
            ctx.lineJoin = reset ? "miter" : "round";
            ctx.strokeStyle = reset
                ? $canvasStore.canvas_data.backgroundColor
                : settings.color;
            ctx.lineWidth = reset ? 1 : settings.size;
        }
    }

    function updateBoundingBox(x: number, y: number) {
        leftMost = leftMost < x ? leftMost : x;
        rightMost = rightMost > x ? rightMost : x;
        topMost = topMost < y ? topMost : y;
        bottomMost = bottomMost > y ? bottomMost : y;

        dispatchUpdateBoundingBox();
    }

    export function serialize(): PieceSerialized {
        const s: PieceSerialized = {
            settings: settings,
            path: pathSVG,
            move: moveMatrix.toJSON(),
            leftMost: leftMost,
            rightMost: rightMost,
            topMost: topMost,
            bottomMost: bottomMost,
            index: index,
        };

        return s;
    }

    export function deserialize(s: PieceSerialized) {
        settings = s.settings;

        pathSVG = s.path;
        path = new Path2D(s.path + "C");

        moveMatrix = DOMMatrix.fromMatrix(s.move);

        let updatedPath = new Path2D();
        updatedPath.addPath(path, moveMatrix);
        path = updatedPath;

        updatedPath = new Path2D();
        let clientOffsetMatrix = new DOMMatrix()
            .translate(
                $canvasStore.canvas_data.zoomDx,
                $canvasStore.canvas_data.zoomDy,
            )
            .translate(
                $canvasStore.canvas_data.xPan,
                $canvasStore.canvas_data.yPan,
            );
        updatedPath.addPath(path, clientOffsetMatrix);
        path = updatedPath;

        leftMost = s.leftMost;
        rightMost = s.rightMost;
        topMost = s.topMost;
        bottomMost = s.bottomMost;

        if (s.index !== undefined) {
            index = s.index;
        }
    }

    export function isPointInStroke(x: number, y: number) {
        setDrawSettings();
        return ctx?.isPointInStroke(path, x, y);
    }

    export function doesBoundingBoxOverlap(boundingBox: Array<number>) {
        const [x, y, width, height] = getBoundingBox();
        const [_x, _y, _width, _height] = boundingBox;

        const xOverlap = x < _x + _width && x + width > _x;
        const yOverlap = y < _y + _height && y + height > _y;

        return xOverlap && yOverlap;
    }

    export function draw(p?: Path2D) {
        if (!p) {
            p = path;
        }
        setDrawSettings();
        ctx?.stroke(p);
        if (selected) {
            drawBoundingBoxBorder();
        }
    }

    export function addClientOffsetX(x: number): number {
        return (
            x + $canvasStore.canvas_data.xPan + $canvasStore.canvas_data.zoomDx
        );
    }

    export function addClientOffsetY(y: number): number {
        return (
            y + $canvasStore.canvas_data.yPan + $canvasStore.canvas_data.zoomDy
        );
    }

    export function subClientOffsetX(x: number): number {
        return (
            x - $canvasStore.canvas_data.xPan - $canvasStore.canvas_data.zoomDx
        );
    }

    export function subClientOffsetY(y: number): number {
        return (
            y - $canvasStore.canvas_data.yPan - $canvasStore.canvas_data.zoomDy
        );
    }

    export function calcLeftMost() {
        return addClientOffsetX(leftMost);
    }

    export function calcRightMost() {
        return addClientOffsetX(rightMost);
    }

    export function calcTopMost() {
        return addClientOffsetY(topMost);
    }

    export function calcBottomMost() {
        return addClientOffsetY(bottomMost);
    }

    export function getBoundingBox() {
        const clearMargin = settings.size / 2;

        const x = calcLeftMost() - clearMargin;
        const y = calcTopMost() - clearMargin;

        const width = calcRightMost() - calcLeftMost() + clearMargin * 2;
        const height = calcBottomMost() - calcTopMost() + clearMargin * 2;

        return [x, y, width, height];
    }

    export function clearBoundingBox() {
        if (ctx) {
            const clearMargin = 1 / $canvasStore.canvas_data.zoom;
            const [x, y, width, height] = getBoundingBox();

            setDrawSettings(true);
            ctx.fillRect(
                x - clearMargin,
                y - clearMargin,
                width + clearMargin * 2,
                height + clearMargin * 2,
            );
        }
    }

    export function drawBoundingBoxBorder() {
        if (ctx) {
            const clearMargin = 1 / $canvasStore.canvas_data.zoom;
            const [x, y, width, height] = getBoundingBox();
            ctx.beginPath();
            setDrawSettings(true);
            ctx.lineWidth = 1 / $canvasStore.canvas_data.zoom;
            ctx.strokeStyle = "#FFFFFF";
            ctx.rect(
                x + clearMargin,
                y + clearMargin,
                width - clearMargin * 2,
                height - clearMargin * 2,
            );
            ctx.closePath();
            ctx.stroke();
        }
    }

    export function addPoint() {
        const mouseX = $canvasStore.canvas_data.mouseX;
        const mouseY = $canvasStore.canvas_data.mouseY;
        let thereIsChangeOnX = mouseX >= latestPointX || mouseX <= latestPointX;
        let thereIsChangeOnY = mouseY >= latestPointY || mouseY <= latestPointY;

        let newX = latestPointX;
        let newY = latestPointY;

        if (thereIsChangeOnX) {
            newX = mouseX;
        }
        if (thereIsChangeOnY) {
            newY = mouseY;
        }

        if (thereIsChangeOnX || thereIsChangeOnY) {
            path.lineTo(newX, newY);
            updateBoundingBox(subClientOffsetX(newX), subClientOffsetY(newY));

            const addedPath = new Path2D();
            addedPath.moveTo(latestPointX, latestPointY);
            addedPath.lineTo(newX, newY);

            // Serialize path
            pathSVG += `M${subClientOffsetX(latestPointX)} ${subClientOffsetY(latestPointY)} L${subClientOffsetX(newX)} ${subClientOffsetY(newY)}`;

            draw(addedPath);

            latestPointX = newX;
            latestPointY = newY;
        }

        return [newX, newY];
    }

    export function select() {
        selected = true;
    }

    export function deselect() {
        selected = false;
    }

    export function move(isPan = false, dx?: number, dy?: number) {
        if (dx === undefined && dy === undefined) {
            let mouseX = $canvasStore.canvas_data.mouseX;
            let mouseY = $canvasStore.canvas_data.mouseY;

            let prevMouseX = $canvasStore.canvas_data.prevMouseX;
            let prevMouseY = $canvasStore.canvas_data.prevMouseY;

            dx = mouseX - prevMouseX;
            dy = mouseY - prevMouseY;
        }

        let m = new DOMMatrix();
        m.translateSelf(dx, dy);

        if (isPan) {
            panMatrix.translateSelf(dx, dy);
        } else {
            moveMatrix.translateSelf(dx, dy);
            if (dx !== undefined && dy !== undefined) {
                leftMost += dx;
                rightMost += dx;
                topMost += dy;
                bottomMost += dy;
            }
        }

        let updatedPath = new Path2D();
        updatedPath.addPath(path, m);
        path = updatedPath;
    }

    function updateSettings<K extends keyof PieceSettings>(
        setting: K,
        value: PieceSettings[K],
    ) {
        dispatchUpdate(false);
        settings[setting] = value;
        dispatchUpdate(true);
    }

    function handleUpdateSettings(e: Event, setting: keyof PieceSettings) {
        const target = e.target as HTMLInputElement;
        updateSettings(setting, target.value);
    }
</script>

{#if selected}
    <div
        class="piece-settings control-panel z-10"
        style="bottom: min({($canvasStore.canvas_data.height ?? 0) -
            calcTopMost() * $canvasStore.canvas_data.zoom}px, {$canvasStore
            .canvas_data.height ?? 0}px); left: {Math.max(
            calcLeftMost() * $canvasStore.canvas_data.zoom,
            0,
        )}px;"
    >
        <div class="flex gap-4">
            <span>i: {index}</span>
            <span>x: {Math.round(leftMost)}</span>
            <span>y: {Math.round(topMost)}</span>
        </div>

        <div class="control-group">
            <div class="control">
                <label for="">size</label>
                <input
                    value={settings.size}
                    type="range"
                    min="1"
                    step="1"
                    max="100"
                    on:input={(e) => handleUpdateSettings(e, "size")}
                />
            </div>
        </div>

        <div class="control-group">
            <div class="control">
                <label for="">color</label>
                <input
                    value={settings.color}
                    type="color"
                    on:input={(e) => handleUpdateSettings(e, "color")}
                />
            </div>
        </div>
    </div>
{/if}

<style>
    .piece-settings {
        position: absolute;
        background-color: var(--color-back-2);
        padding: 0 1em 0 1em;
        border-radius: 5px;
        border-top: 10px var(--color-back-3) solid;
        border-bottom: 10px var(--color-back-3) solid;
    }
</style>
