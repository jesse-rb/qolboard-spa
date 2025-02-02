<script lang="ts">
    import { createEventDispatcher, getContext } from "svelte";
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
    const ctx = $canvasStore.canvasData.ctx;

    let pathSVG = "";
    let moveMatrix = new DOMMatrix();
    let panMatrix = new DOMMatrix();
    let path = new Path2D();

    let latestPointX = $canvasStore.canvasData.mouseX;
    let latestPointY = $canvasStore.canvasData.mouseY;

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
                ? $canvasStore.canvasData.backgroundColor
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
            pan: panMatrix.toJSON(),
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
        panMatrix = DOMMatrix.fromMatrix(s.pan);

        let updatedPath = new Path2D();
        updatedPath.addPath(path, moveMatrix);
        path = updatedPath;

        updatedPath = new Path2D();
        updatedPath.addPath(path, panMatrix);
        path = updatedPath;

        leftMost = s.leftMost;
        rightMost = s.rightMost;
        topMost = s.topMost;
        bottomMost = s.bottomMost;

        index = s.index;
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

    export function getBoundingBox() {
        const clearMargin = settings.size;

        const x = leftMost - clearMargin;
        const y = topMost - clearMargin;

        const width = rightMost - leftMost + clearMargin * 2;
        const height = bottomMost - topMost + clearMargin * 2;

        return [x, y, width, height];
    }

    export function clearBoundingBox() {
        if (ctx) {
            const clearMargin = 1 / $canvasStore.canvasData.zoom;
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
            const clearMargin = 1 / $canvasStore.canvasData.zoom;
            const [x, y, width, height] = getBoundingBox();
            ctx.beginPath();
            setDrawSettings(true);
            ctx.lineWidth = 1 / $canvasStore.canvasData.zoom;
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
        const mouseX = $canvasStore.canvasData.mouseX;
        const mouseY = $canvasStore.canvasData.mouseY;

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
            updateBoundingBox(newX, newY);

            const addedPath = new Path2D();
            addedPath.moveTo(latestPointX, latestPointY);
            addedPath.lineTo(newX, newY);

            // Serialize path
            pathSVG += `M${latestPointX} ${latestPointY} L${newX} ${newY}`;

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
            let mouseX = $canvasStore.canvasData.mouseX;
            let mouseY = $canvasStore.canvasData.mouseY;

            let prevMouseX = $canvasStore.canvasData.prevMouseX;
            let prevMouseY = $canvasStore.canvasData.prevMouseY;

            dx = mouseX - prevMouseX;
            dy = mouseY - prevMouseY;
        }

        let m = new DOMMatrix();
        m.translateSelf(dx, dy);

        if (isPan) {
            panMatrix.translateSelf(dx, dy);
        } else {
            moveMatrix.translateSelf(dx, dy);
        }

        if (dx !== undefined && dy !== undefined) {
            leftMost += dx;
            rightMost += dx;
            topMost += dy;
            bottomMost += dy;
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
        style="bottom: min({($canvasStore.canvasData.height ?? 0) -
            topMost * $canvasStore.canvasData.zoom}px, {$canvasStore.canvasData
            .height ?? 0}px); left: {Math.max(
            leftMost * $canvasStore.canvasData.zoom,
            0,
        )}px;"
    >
        <div class="flex gap-4">
            <span
                >x: {Math.round(
                    (leftMost -
                        $canvasStore.canvasData.xPan -
                        $canvasStore.canvasData.zoomDx) *
                        $canvasStore.canvasData.zoom,
                )}</span
            >
            <span
                >y: {Math.round(
                    (topMost -
                        $canvasStore.canvasData.yPan -
                        $canvasStore.canvasData.zoomDy) *
                        $canvasStore.canvasData.zoom,
                )}</span
            >
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
