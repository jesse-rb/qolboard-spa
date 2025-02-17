<script lang="ts">
    import { onMount, setContext, tick } from "svelte";
    import PiecesManager from "./PiecesManager.svelte";
    import ControlPanel from "./ControlPanel.svelte";
    import Ruler from "./Ruler.svelte";
    import { CanvasModes } from "./enums/modes";
    import type {
        Canvas,
        CanvasData,
        CanvasWithoutClientCanvasData,
        ClientCanvasData,
    } from "./types/canvas";
    import type { CanvasActions } from "./enums/actions";
    import { appStore } from "../../store";
    import { pushState } from "$app/navigation";
    import { writable, type Writable } from "svelte/store";
    import Cursors from "./Cursors.svelte";
    import type { TypeBindPiece } from "./types/piece";
    import { envIsLocal, sleep } from "$lib/util";
    import Piece from "./Piece.svelte";

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
            ...getDefaultClientCanvasData(),
            ...getDefaultCanvasData(),
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
                canvas.canvasData = {
                    ...getDefaultClientCanvasData(),
                    ...canvas.canvasData,
                };
                deserialize(canvas);
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
                    e.preventDefault();
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
                const zoom = wheelDeltaY < 0 ? 100 / 90 : 90 / 100; // Once again the answer was in the original qolboard codebase. Not falling for ? 1.05 : 0.95 again! lol >:(
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

            let proto = "wss://";
            if (envIsLocal()) {
                proto = "ws://";
            }

            let host = `${proto}${domain}`;
            if (envIsLocal()) {
                host = `${host}:${port}`;
            }

            ws = new WebSocket(`${host}/user/ws/canvas/${id}`);
            console.log("Attempting to connect to websocket");

            // Listen for socket open
            ws.onopen = () => {
                console.log("Successfully connected to socket");
                window.setInterval(websocketKeepAlive, 30000 /*ms*/);
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
                    case "add-piece": {
                        piecesManager.addSerializedPiece(message.data);
                        break;
                    }
                    case "update-piece": {
                        piecesManager.updatePiece(message.data);
                        break;
                    }
                    case "update-canvas-data": {
                        deserialize(message.data);
                        draw();
                        break;
                    }
                    default: {
                        break;
                    }
                }
            };
        }
    }

    let websocketKeepAlive = function () {
        let message = { desc: "keep-alive" };
        const d = {
            event: "keep-alive",
            email: $appStore.user.email,
            data: null,
        };
        ws?.send(JSON.stringify(d));
    };

    function websocketMouseMove() {
        const d = {
            event: "mouse-move",
            email: $appStore.user.email,
            data: {
                x:
                    $store.canvasData.mouseX -
                    $store.canvasData.xPan -
                    $store.canvasData.zoomDx,
                y:
                    $store.canvasData.mouseY -
                    $store.canvasData.yPan -
                    $store.canvasData.zoomDy,
            },
        };

        ws?.send(JSON.stringify(d));
    }

    async function websocketAddPiece(p: TypeBindPiece) {
        await tick(); // Wait for this piece svelte component to be initialized

        const d = {
            event: "add-piece",
            email: $appStore.user.email,
            data: p?.component?.serialize(),
        };

        ws?.send(JSON.stringify(d));
    }

    async function websocketUpdatePiece(p: TypeBindPiece) {
        await tick();

        const d = {
            event: "update-piece",
            email: $appStore.user.email,
            data: p.component?.serialize(),
        };

        ws?.send(JSON.stringify(d));
    }

    async function websocketUpdatedCanvasData() {
        await tick();

        const d = {
            event: "update-canvas-data",
            email: $appStore.user.email,
            data: serialize(),
        };

        ws?.send(JSON.stringify(d));
    }

    function getDefaultClientCanvasData(): ClientCanvasData {
        return {
            width: width,
            height: height,
            activeMode: CanvasModes.Draw,
            mouseDown: false,
            mouseX: 0,
            mouseY: 0,
            prevMouseX: 0,
            prevMouseY: 0,
            xPan: 0,
            yPan: 0,
            zoom: 1,
            zoomDx: 0,
            zoomDy: 0,
        };
    }

    function getDefaultCanvasData(): CanvasData {
        return {
            name: "My new canvas",
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
        };
    }

    async function saveCanvas() {
        saveIsLoading = true;

        const domain = import.meta.env.VITE_API_HOST;
        let path = "user/canvas";
        if (id !== null) {
            path = `${path}/${id}`;
        }
        const url = `${domain}/${path}`;

        const body = serialize().canvasData;

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
                const body: {
                    msg: string;
                    canvas: CanvasWithoutClientCanvasData;
                } = await response.json();
                if (body.canvas.id) {
                    id = body.canvas.id;

                    const cd: CanvasData & ClientCanvasData = {
                        ...getDefaultClientCanvasData(),
                        ...body.canvas.canvasData,
                    };
                    const c: Canvas = {
                        ...body.canvas,
                        ...{ canvasData: cd },
                    };
                    deserialize(c);
                    pushState(`/canvas/${id}`, id);
                }
            }
        }

        saveIsLoading = false;
    }

    async function getCanvas(
        _id: number,
    ): Promise<CanvasWithoutClientCanvasData | null> {
        // loading = true;

        const domain = import.meta.env.VITE_API_HOST;
        const path = `user/canvas/${_id}`;
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
        } else {
            id = null;
            pushState("/", 0);
        }

        // loading = false;

        return null;
    }

    function serialize(withPiecesManager: boolean = true) {
        const canvasData: CanvasData = {
            name: $store.canvasData.name,
            backgroundColor: $store.canvasData.backgroundColor,
            snapToGrid: $store.canvasData.snapToGrid,
            rulerSettings: $store.canvasData.rulerSettings,
            pieceSettings: $store.canvasData.pieceSettings,
        };

        if (withPiecesManager) {
            canvasData.piecesManager = piecesManager.serialize();
        }

        const canvas: CanvasWithoutClientCanvasData = {
            id: $store.id,
            canvasData: canvasData,
        };

        return canvas;
    }

    function deserialize(canvas: CanvasWithoutClientCanvasData) {
        $store.canvasData = { ...$store.canvasData, ...canvas.canvasData };
        if (canvas.user) {
            $store.user = canvas.user;
        }
        if (canvas.canvas_shared_invitations) {
            $store.canvas_shared_invitations = canvas.canvas_shared_invitations;
        }
        if (canvas.canvas_shared_accesses) {
            $store.canvas_shared_accesses = canvas.canvas_shared_accesses;
        }

        if ($store.canvasData.piecesManager) {
            piecesManager.deserialize($store.canvasData.piecesManager);
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
            let piece = piecesManager.addPiece();
            websocketAddPiece(piece);
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
            const piece = piecesManager.addPointToLatestPiece();
            websocketUpdatePiece(piece);
        }

        if (
            $store.canvasData.activeMode == CanvasModes.Grab &&
            $store.canvasData.mouseDown
        ) {
            if (piecesManager.getSelected()) {
                const piece = piecesManager.move();
                if (piece) {
                    websocketUpdatePiece(piece);
                }
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
            on:updatedCanvasData={websocketUpdatedCanvasData}
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

        <PiecesManager
            bind:this={piecesManager}
            on:update-piece={(e) => websocketUpdatePiece(e.detail)}
        />

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
