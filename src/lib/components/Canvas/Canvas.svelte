<script lang="ts">
    import { SvelteComponent, onMount, setContext, tick } from "svelte";
    import PiecesManager from "./PiecesManager.svelte";
    import ControlPanel from "./ControlPanel.svelte";
    import Ruler from "./Ruler.svelte";
    import { CanvasModes } from "./enums/modes";
    import type { Canvas, CanvasData } from "./types/canvas";
    import type { CanvasActions } from "./enums/actions";
    import { appStore } from "../../store";
    import { pushState } from "$app/navigation";
    import { writable, type Writable } from "svelte/store";
    import Cursors from "./Cursors.svelte";

    export let id: number | null = null;
    export let preview: boolean = false;

    let elemContaienr: HTMLDivElement;
    let elemCanvas: HTMLCanvasElement;

    let piecesManager: PiecesManager;

    let keyDown: string | null = null;

    let overiddenActiveMode: CanvasModes | null;

    let width: number;
    let height: number;

    let saveIsLoading = false;

    // Allow each canvas instance to have it's own separate store instance (not a shared store)
    const store: Writable<Canvas> = writable({
        canvasData: {
            name: "A blank canvas",
            width: 0,
            height: 0,
            activeMode: CanvasModes.Draw,
            mouseDown: false,
            mouseX: 0,
            mouseY: 0,
            prevMouseX: 0,
            prevMouseY: 0,
            xPan: 0,
            yPan: 0,
            backgroundColor: "#1A1A1A",
            snapToGrid: false,
            pieceSettings: {
                size: 20,
                color: "#D55C1A",
            },
            rulerSettings: {
                showUnits: true,
                showLines: false,
            },
            zoom: 1,
            zoomDx: 0,
            zoomDy: 0,
        },
    });
    setContext("canvasStore", store);

    $: canvasOffsetTop = $appStore.headerHeight;
    $: canvasOffsetLeft = $appStore.controlPanelWidth;

    $: if (width && height) {
        updateCanvasSize(width, height);
    }

    // Connect to socket
    let ws: WebSocket | null = null;

    type websocktMessage = {
        event: string;
        email: string;
        data: any;
    };
    let cursors: Record<string, { x: number; y: number }> = {};

    onMount(async () => {
        // Init canvas context
        const _ctx = elemCanvas.getContext("2d");
        if (_ctx !== null) {
            $store.canvasData.ctx = _ctx;
        } else {
            throw new Error("2D canvas rendering context is not available");
        }

        if (id !== null) {
            const canvas = await getCanvas(id);
            if (canvas) {
                await deserialize(canvas);
            }
        }

        if (!preview) {
            initWebSocket();

            // Init global event listeners for things such as keyboard shortcuts
            window.addEventListener("keydown", (e) => {
                const key = e.key;

                // Register keydown keyboard shortcuts
                if (keyDown === null) {
                    keyDown = key;
                    if (key === " ") {
                        overiddenActiveMode = $store.canvasData.activeMode;
                        setActiveMode(CanvasModes.Pan);
                    }
                }
            });
            window.addEventListener("keyup", (e) => {
                const key = e.key;

                // Register keyup keyboard shortcuts
                if (key === " ") {
                    if (overiddenActiveMode) {
                        setActiveMode(overiddenActiveMode);
                    }
                    overiddenActiveMode = null;
                    $store.canvasData.mouseDown = false;
                }

                keyDown = null;
            });
            elemCanvas.addEventListener("wheel", (e) => {
                const wheelDeltaY = e.deltaY;
                const zoom = wheelDeltaY < 0 ? 100 / 99 : 99 / 100; // Once again the answer was in the original qolboard codebase. Not falling for ? 1.05 : 0.95 again! lol >:(
                $store.canvasData.ctx?.scale(zoom, zoom);

                const oldZoom = $store.canvasData.zoom;
                $store.canvasData.zoom = $store.canvasData.zoom * zoom;

                // Pan according to zoom, to center canvas after zoom
                let dx =
                    Math.abs(
                        ($store.canvasData.width ?? 0) /
                            $store.canvasData.zoom -
                            ($store.canvasData.width ?? 0) / oldZoom,
                    ) / 2;
                let dy =
                    Math.abs(
                        ($store.canvasData.height ?? 0) /
                            $store.canvasData.zoom -
                            ($store.canvasData.height ?? 0) / oldZoom,
                    ) / 2;

                dx = dx * (wheelDeltaY > 0 ? 1 : -1);
                dy = dy * (wheelDeltaY > 0 ? 1 : -1);

                $store.canvasData.zoomDx += dx;
                $store.canvasData.zoomDy += dy;

                piecesManager.pan(dx, dy);
                draw();
            });
        }

        // Initial draw
        await tick();
        if (preview) {
            $store.canvasData.zoom *= 0.1;
        }
        $store.canvasData.ctx.scale(
            $store.canvasData.zoom,
            $store.canvasData.zoom,
        );

        await draw();
    });

    function initWebSocket() {
        if (id) {
            const domain = import.meta.env.VITE_API_DOMAIN;
            const port = import.meta.env.VITE_API_PORT;
            ws = new WebSocket(`ws://${domain}:${port}/user/ws/canvas/${id}`);
            console.log("Attempting to connect to websocket");

            // Listen for socket open
            ws.onopen = () => {
                console.log("Successfully connected to socket");
            };

            // Listen for socket close
            ws.onclose = (e) => {
                console.log("Socket closed connection: ", e);
            };

            // Listen for socket errors
            ws.onerror = (e) => {
                console.log("Socket error: ", e);
            };

            ws.onmessage = (e) => {
                let message: websocktMessage = JSON.parse(e.data);
                // Process message from socket
                switch (message.event) {
                    case "mouse-move": {
                        cursors[message.email] = message.data;
                        break;
                    }
                    default: {
                        break;
                    }
                }
            };
        }
    }

    async function saveCanvas() {
        saveIsLoading = true;

        const domain = import.meta.env.VITE_API_HOST;
        let path = "user/canvas";
        if (id !== null) {
            path = `${path}/${id}`;
        }
        const url = `${domain}/${path}`;

        const body = serialize();

        const response = await fetch(url, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify(body),
            headers: {
                "content-type": "application/json",
            },
        });

        if (response.ok) {
            if (id === null) {
                const body: { msg: string; canvas: Canvas } =
                    await response.json();
                if (body.canvas.id) {
                    pushState(`/canvas/${id}`, body.canvas.id);
                }
            }
        }

        saveIsLoading = false;
    }

    async function getCanvas(id: number): Promise<Canvas | null> {
        // loading = true;

        const domain = import.meta.env.VITE_API_HOST;
        const path = `user/canvas/${id}`;
        const url = `${domain}/${path}`;

        const response = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: {
                "content-type": "application/json",
            },
        });

        if (response.ok) {
            const canvas: Canvas = await response.json();
            return canvas;
        }

        // loading = false;

        return null;
    }

    function serialize() {
        const s: CanvasData = {
            name: $store.canvasData.name,
            activeMode: $store.canvasData.activeMode,
            backgroundColor: $store.canvasData.backgroundColor,
            mouseX: $store.canvasData.mouseX,
            mouseY: $store.canvasData.mouseY,
            mouseDown: $store.canvasData.mouseDown,
            prevMouseX: $store.canvasData.prevMouseX,
            prevMouseY: $store.canvasData.prevMouseY,
            xPan: $store.canvasData.xPan,
            yPan: $store.canvasData.yPan,
            zoom: $store.canvasData.zoom,
            zoomDx: $store.canvasData.zoomDx,
            zoomDy: $store.canvasData.zoomDy,
            snapToGrid: $store.canvasData.snapToGrid,
            rulerSettings: $store.canvasData.rulerSettings,
            pieceSettings: $store.canvasData.pieceSettings,
            piecesManager: piecesManager.serialize(),
        };

        return s;
    }

    async function deserialize(canvas: Canvas) {
        $store.id = canvas.id;

        const canvasData = canvas.canvasData;
        $store.canvasData.name = canvasData.name;
        $store.canvasData.activeMode = canvasData.activeMode;
        $store.canvasData.activeMode = canvasData.activeMode;
        $store.canvasData.backgroundColor = canvasData.backgroundColor;
        $store.canvasData.mouseX = canvasData.mouseX;
        $store.canvasData.mouseY = canvasData.mouseY;
        $store.canvasData.mouseDown = canvasData.mouseDown;
        $store.canvasData.prevMouseX = canvasData.prevMouseX;
        $store.canvasData.prevMouseY = canvasData.prevMouseY;
        $store.canvasData.xPan = canvasData.xPan;
        $store.canvasData.yPan = canvasData.yPan;
        $store.canvasData.zoom = canvasData.zoom;
        $store.canvasData.zoomDx = canvasData.zoomDx;
        $store.canvasData.zoomDy = canvasData.zoomDy;
        $store.canvasData.snapToGrid = canvasData.snapToGrid;
        $store.canvasData.pieceSettings = canvasData.pieceSettings;

        if (canvasData.piecesManager) {
            await piecesManager.deserialize(canvasData.piecesManager);
        }
    }

    async function draw() {
        if ($store.canvasData.ctx !== null) {
            await tick(); // If DOM falls behind... await tick();
            updateBackgroundColor();
            piecesManager.draw();
        }
    }

    function updateBackgroundColor() {
        if ($store.canvasData.ctx !== undefined) {
            $store.canvasData.ctx.fillStyle = $store.canvasData.backgroundColor;
            $store.canvasData.ctx.fillRect(
                0,
                0,
                ($store.canvasData.width ?? 0) / $store.canvasData.zoom,
                ($store.canvasData.height ?? 0) / $store.canvasData.zoom,
            );
        }
    }

    async function updateCanvasSize(width: number, height: number) {
        $store.canvasData.width = width;
        $store.canvasData.height = height;
        await tick();
        $store.canvasData.ctx?.scale(
            $store.canvasData.zoom,
            $store.canvasData.zoom,
        );
        draw();
    }

    function setMouseDown(e: MouseEvent, _mouseDown: boolean) {
        e.preventDefault();
        $store.canvasData.mouseDown = _mouseDown;

        if (
            $store.canvasData.activeMode === CanvasModes.Draw &&
            $store.canvasData.mouseDown
        ) {
            piecesManager.addPiece();
        }

        if (
            $store.canvasData.activeMode === CanvasModes.Grab &&
            $store.canvasData.mouseDown
        ) {
            piecesManager.select();
        }
    }

    function setMousePos(e: MouseEvent) {
        const _canvasOffsetLeft = elemCanvas.offsetLeft;
        const _canvasOffsetTop = elemCanvas.offsetTop;
        const scrollOffsetX = document.documentElement.scrollLeft;
        const scrollOffsetY = document.documentElement.scrollTop;
        $store.canvasData.prevMouseX = $store.canvasData.mouseX;
        $store.canvasData.prevMouseY = $store.canvasData.mouseY;

        $store.canvasData.mouseX =
            e.clientX - _canvasOffsetLeft + scrollOffsetX;
        $store.canvasData.mouseY =
            e.clientY - _canvasOffsetTop + scrollOffsetY - canvasOffsetTop; // subtract canvas absolute top offset

        $store.canvasData.mouseX = Math.round(
            $store.canvasData.mouseX / $store.canvasData.zoom,
        );
        $store.canvasData.mouseY = Math.round(
            $store.canvasData.mouseY / $store.canvasData.zoom,
        );

        if (
            $store.canvasData.activeMode == CanvasModes.Draw &&
            $store.canvasData.mouseDown
        ) {
            piecesManager.addPointToLatestPiece();
        }

        if (
            $store.canvasData.activeMode == CanvasModes.Grab &&
            $store.canvasData.mouseDown
        ) {
            if (piecesManager.getSelected()) {
                piecesManager.move();
            } else {
                piecesManager.select();
            }
        }

        if (
            $store.canvasData.activeMode == CanvasModes.Pan &&
            $store.canvasData.mouseDown
        ) {
            piecesManager.pan();
            updateBackgroundColor();
            piecesManager.draw();
            $store.canvasData.xPan +=
                $store.canvasData.mouseX - $store.canvasData.prevMouseX;
            $store.canvasData.yPan +=
                $store.canvasData.mouseY - $store.canvasData.prevMouseY;
        }

        if (
            $store.canvasData.activeMode == CanvasModes.Remove &&
            $store.canvasData.mouseDown
        ) {
            piecesManager.select();
            piecesManager.remove();
        }

        websocketMouseMove();
    }

    function setActiveMode(mode: CanvasModes) {
        $store.canvasData.activeMode = mode;
        piecesManager && piecesManager.deselect();
    }

    function action(action: CanvasActions) {
        if (action === "clear") {
            piecesManager.clear();
            draw();
        }
    }

    function websocketMouseMove() {
        const d = {
            event: "mouse-move",
            email: $appStore.email,
            data: {
                x: $store.canvasData.mouseX,
                y: $store.canvasData.mouseY,
            },
        };

        ws?.send(JSON.stringify(d));
    }

    // Get or set rgba value of pixel at given coordinates
    function coord(
        x: number,
        y: number,
        rgba: Array<number>,
        set: boolean = false,
    ): Array<number> {
        let imageData = $store.canvasData.ctx?.getImageData(
            0,
            0,
            $store.canvasData.width ?? 0,
            $store.canvasData.height ?? 0,
        );
        const colorsOffset = 4; // RGBA
        const rx = x * colorsOffset;
        const ry = y * ($store.canvasData.width ?? 0) * colorsOffset;
        const _rgba = [];
        if (imageData) {
            for (let i = 0; i < colorsOffset; i++) {
                if (set) {
                    imageData.data[rx + ry + i] = rgba[i];
                }
                _rgba.push(imageData.data[rx + ry + i]);
            }
        }
        return _rgba;
    }
</script>

{#if preview}
    <div
        bind:clientWidth={width}
        bind:clientHeight={height}
        class="overflow-hidden"
    >
        <canvas class="rounded-md" bind:this={elemCanvas} height="90px" />
    </div>

    <PiecesManager bind:this={piecesManager} />
{:else}
    <Cursors {cursors} />

    <div class="canvas-component">
        <ControlPanel
            {saveIsLoading}
            on:setActiveMode={(e) => setActiveMode(e.detail)}
            on:action={(e) => action(e.detail)}
            on:updatedBackgroundColor={draw}
            on:save={saveCanvas}
        />

        <div
            bind:clientWidth={width}
            bind:clientHeight={height}
            bind:this={elemContaienr}
            class="canvas-container absolute right-0 bottom-0 left-0 -z-10"
        >
            <canvas
                class="absolute hover:cursor-crosshair"
                bind:this={elemCanvas}
                width="{$store.canvasData.width}px"
                height="{$store.canvasData.height}px"
                on:mousedown={(e) => setMouseDown(e, true)}
                on:mouseup={(e) => setMouseDown(e, false)}
                on:mouseleave={(e) => setMouseDown(e, false)}
                on:mousemove={(e) => setMousePos(e)}
            />
        </div>

        <PiecesManager bind:this={piecesManager} />

        <Ruler />
        <Ruler isHorizontal={false} />
    </div>
{/if}

<style>
    .canvas-container {
        top: var(--canvas-offset-top);
        right: var(--canvas-offset-right);
    }
</style>
