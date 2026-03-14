<script lang="ts">
    import { onDestroy, onMount, setContext, tick } from "svelte";
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
    import type { PieceSerialized } from "./types/piece";
    import { envIsLocal } from "$lib/util";
    import type { ShowResponse } from "$lib/types/types";
    import Piece from "./Piece.svelte";

    interface Props {
        id?: number | null;
        preview?: boolean;
        canvasData?: CanvasWithoutClientCanvasData | null;
    }

    let {
        id = $bindable(null),
        preview = false,
        canvasData = null,
    }: Props = $props();

    let elemContaienr: HTMLDivElement | null = $state(null);
    let elemCanvas: HTMLCanvasElement | null = $state(null);

    let piecesManager: PiecesManager | null = $state(null);

    let keyDown: string | null = null;

    let overiddenActiveMode: CanvasModes | null;

    let width: number = $state(0);
    let height: number = $state(0);

    let saveIsLoading = $state(false);

    // Allow each canvas instance to have it's own separate store instance (not a shared store)
    const store: Writable<Canvas> = writable({
        canvas_data: {
            ...getDefaultClientCanvasData(),
            ...getDefaultCanvasData(),
        },
        user_uuid: "",
    });
    setContext("canvasStore", store);

    // Connect to socket
    let ws: WebSocket | null = null;

    type websocktMessage = {
        event: string;
        email: string;
        data: any;
    };
    let cursors: Record<string, { x: number; y: number }> = $state({});

    onMount(async () => {
        if (elemCanvas == null) {
            console.log("WARN: elemCanvas is null");
            return;
        }
        if (piecesManager == null) {
            console.log("WARN: piecesManager is null");
            return;
        }
        // Init canvas context
        const _ctx = elemCanvas.getContext("2d");
        if (_ctx !== null) {
            $store.canvas_data.ctx = _ctx;
        } else {
            throw new Error("2D canvas rendering context is not available");
        }

        // Get canvas data and deserialize if this is an existing canvas
        if (id !== null) {
            let canvas = null;

            if (!preview) {
                // Fetch canvas data from API
                canvas = await getCanvas(id);
            } else if (canvasData) {
                // Use provided canvas data if in preview mode
                canvas = canvasData;
            }

            if (canvas) {
                canvas.canvas_data = {
                    ...getDefaultClientCanvasData(),
                    ...canvas.canvas_data,
                };

                if (!preview) {
                    deserialize(canvas, false);
                } else {
                    deserialize(canvas);
                }
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
                        overiddenActiveMode = $store.canvas_data.activeMode;
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
                    $store.canvas_data.mouseDown = false;
                }

                keyDown = null;
            });
            elemCanvas.addEventListener("wheel", (e) => {
                const wheelDeltaY = e.deltaY;
                const zoom = wheelDeltaY < 0 ? 100 / 90 : 90 / 100; // Once again the answer was in the original qolboard codebase. Not falling for ? 1.05 : 0.95 again! lol >:(
                $store.canvas_data.ctx?.scale(zoom, zoom);

                const oldZoom = $store.canvas_data.zoom;
                $store.canvas_data.zoom = $store.canvas_data.zoom * zoom;

                // Pan according to zoom, to center canvas after zoom
                let dx =
                    Math.abs(
                        ($store.canvas_data.width ?? 0) /
                            $store.canvas_data.zoom -
                            ($store.canvas_data.width ?? 0) / oldZoom,
                    ) / 2;
                let dy =
                    Math.abs(
                        ($store.canvas_data.height ?? 0) /
                            $store.canvas_data.zoom -
                            ($store.canvas_data.height ?? 0) / oldZoom,
                    ) / 2;

                dx = dx * (wheelDeltaY > 0 ? 1 : -1);
                dy = dy * (wheelDeltaY > 0 ? 1 : -1);

                $store.canvas_data.zoomDx += dx;
                $store.canvas_data.zoomDy += dy;

                getPiecesManager().pan(dx, dy);
                draw();
            });
        }

        // Initial draw
        if (preview) {
            $store.canvas_data.zoom *= 0.1;
        }
        $store.canvas_data.ctx.scale(
            $store.canvas_data.zoom,
            $store.canvas_data.zoom,
        );

        await draw();
    });

    onDestroy(() => {
        if (ws) {
            ws.close();
        }
    });

    function getPiecesManager(): PiecesManager {
        if (piecesManager == null) {
            throw new Error("Pieces manager is undefined");
        }

        return piecesManager;
    }

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
                        getPiecesManager().addSerializedPiece(message.data);
                        break;
                    }
                    case "update-piece": {
                        getPiecesManager().updatePiece(message.data);
                        break;
                    }
                    case "remove-piece": {
                        console.log("Removing piece", message.data);
                        getPiecesManager().removePiece(message.data);
                        break;
                    }
                    case "update-canvas-data": {
                        deserialize(message.data);
                        draw();
                        break;
                    }
                    case "get": {
                        deserialize(message.data, false);
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
                    $store.canvas_data.mouseX -
                    $store.canvas_data.xPan -
                    $store.canvas_data.zoomDx,
                y:
                    $store.canvas_data.mouseY -
                    $store.canvas_data.yPan -
                    $store.canvas_data.zoomDy,
            },
        };

        ws?.send(JSON.stringify(d));
    }

    async function websocketAddPiece(p: Piece) {
        const d = {
            event: "add-piece",
            email: $appStore.user.email,
            data: p.serialize(),
        };

        ws?.send(JSON.stringify(d));
    }

    async function websocketUpdatePiece(p: Piece) {
        const d = {
            event: "update-piece",
            email: $appStore.user.email,
            data: p.serialize(),
        };

        ws?.send(JSON.stringify(d));
    }

    async function websocketRemovePiece(p: PieceSerialized) {
        const d = {
            event: "remove-piece",
            email: $appStore.user.email,
            data: p,
        };

        ws?.send(JSON.stringify(d));
    }

    async function websocketUpdatedCanvasData() {
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

        const body = serialize().canvas_data;

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
                        ...body.canvas.canvas_data,
                    };
                    const c: Canvas = {
                        ...body.canvas,
                        ...{ canvas_data: cd },
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
        const path = `user/canvas/${_id}?with[]=user&with[]=canvas_shared_invitations&with[]=canvas_shared_accesses.user`;
        const url = `${domain}/${path}`;

        const response = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: {
                "content-type": "application/json",
            },
        });

        if (response.ok) {
            const json: ShowResponse<Canvas> = await response.json();
            console.log(json);
            const canvas = json.data;
            return canvas;
        } else {
            id = null;
            pushState("/", 0);
        }

        // loading = false;

        return null;
    }

    function serialize(withPiecesManager: boolean = true) {
        const canvas_data: CanvasData = {
            name: $store.canvas_data.name,
            backgroundColor: $store.canvas_data.backgroundColor,
            snapToGrid: $store.canvas_data.snapToGrid,
            rulerSettings: $store.canvas_data.rulerSettings,
            pieceSettings: $store.canvas_data.pieceSettings,
        };

        if (withPiecesManager) {
            canvas_data.piecesManager = getPiecesManager().serialize();
        }

        const canvas: CanvasWithoutClientCanvasData = {
            id: $store.id,
            user_uuid: $store.user_uuid,
            canvas_data: canvas_data,
        };

        return canvas;
    }

    function deserialize(
        canvas: CanvasWithoutClientCanvasData,
        deserializeCanvasData: boolean = true,
    ) {
        $store.id = canvas.id;
        $store.createdAt = canvas.createdAt;
        $store.updatedAt = canvas.updatedAt;
        $store.deletedAt = canvas.deletedAt;

        if (deserializeCanvasData) {
            $store.canvas_data = {
                ...$store.canvas_data,
                ...canvas.canvas_data,
            };
        }

        if (canvas.user) {
            $store.user = canvas.user;
        }
        if (canvas.canvas_shared_invitations) {
            $store.canvas_shared_invitations = canvas.canvas_shared_invitations;
        }
        if (canvas.canvas_shared_accesses) {
            $store.canvas_shared_accesses = canvas.canvas_shared_accesses;
        }

        if (deserializeCanvasData && $store.canvas_data.piecesManager) {
            getPiecesManager().deserialize($store.canvas_data.piecesManager);
        }
    }

    async function draw() {
        if ($store.canvas_data.ctx !== null) {
            await tick(); // If DOM falls behind... await tick();
            updateBackgroundColor();
            getPiecesManager().draw();
        }
    }

    function updateBackgroundColor() {
        if ($store.canvas_data.ctx !== undefined) {
            $store.canvas_data.ctx.fillStyle =
                $store.canvas_data.backgroundColor;
            $store.canvas_data.ctx.fillRect(
                0,
                0,
                ($store.canvas_data.width ?? 0) / $store.canvas_data.zoom,
                ($store.canvas_data.height ?? 0) / $store.canvas_data.zoom,
            );
        }
    }

    async function updateCanvasSize(width: number, height: number) {
        $store.canvas_data.width = width;
        $store.canvas_data.height = height;
        await tick();
        $store.canvas_data.ctx?.scale(
            $store.canvas_data.zoom,
            $store.canvas_data.zoom,
        );
        draw();
    }

    function setMouseDown(e: MouseEvent, _mouseDown: boolean) {
        e.preventDefault();
        $store.canvas_data.mouseDown = _mouseDown;

        if (
            $store.canvas_data.activeMode === CanvasModes.Draw &&
            $store.canvas_data.mouseDown
        ) {
            const i = getPiecesManager().addPiece();
            tick().then(() => {
                const p = getPiecesManager().getPiece(i);
                if (p) {
                    websocketAddPiece(p);
                }
            });
        }

        if (
            $store.canvas_data.activeMode === CanvasModes.Grab &&
            $store.canvas_data.mouseDown
        ) {
            getPiecesManager().select();
        }
    }

    function setMousePos(e: MouseEvent) {
        const _canvasOffsetLeft = elemCanvas?.offsetLeft ?? 0;
        const _canvasOffsetTop = elemCanvas?.offsetTop ?? 0;
        const scrollOffsetX = document.documentElement.scrollLeft;
        const scrollOffsetY = document.documentElement.scrollTop;
        $store.canvas_data.prevMouseX = $store.canvas_data.mouseX;
        $store.canvas_data.prevMouseY = $store.canvas_data.mouseY;

        $store.canvas_data.mouseX =
            e.clientX - _canvasOffsetLeft + scrollOffsetX;
        $store.canvas_data.mouseY =
            e.clientY - _canvasOffsetTop + scrollOffsetY - canvasOffsetTop; // subtract canvas absolute top offset

        $store.canvas_data.mouseX = Math.round(
            $store.canvas_data.mouseX / $store.canvas_data.zoom,
        );
        $store.canvas_data.mouseY = Math.round(
            $store.canvas_data.mouseY / $store.canvas_data.zoom,
        );

        if (
            $store.canvas_data.activeMode == CanvasModes.Draw &&
            $store.canvas_data.mouseDown
        ) {
            const piece = getPiecesManager().addPointToLatestPiece();
            websocketUpdatePiece(piece);
        }

        if (
            $store.canvas_data.activeMode == CanvasModes.Grab &&
            $store.canvas_data.mouseDown
        ) {
            if (getPiecesManager().getSelectedPiece() !== undefined) {
                const piece = getPiecesManager().move();
                if (piece) {
                    websocketUpdatePiece(piece);
                }
            } else {
                getPiecesManager().select();
            }
        }

        if (
            $store.canvas_data.activeMode == CanvasModes.Pan &&
            $store.canvas_data.mouseDown
        ) {
            getPiecesManager().pan();
            updateBackgroundColor();
            getPiecesManager().draw();
            $store.canvas_data.xPan +=
                $store.canvas_data.mouseX - $store.canvas_data.prevMouseX;
            $store.canvas_data.yPan +=
                $store.canvas_data.mouseY - $store.canvas_data.prevMouseY;
        }

        if (
            $store.canvas_data.activeMode == CanvasModes.Remove &&
            $store.canvas_data.mouseDown
        ) {
            getPiecesManager().select();
            getPiecesManager().removeSelected();
        }

        websocketMouseMove();
    }

    function setActiveMode(mode: CanvasModes) {
        $store.canvas_data.activeMode = mode;
        piecesManager && piecesManager.deselect();
    }

    function action(action: CanvasActions) {
        if (action === "clear") {
            getPiecesManager().clear();
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
        let imageData = $store.canvas_data.ctx?.getImageData(
            0,
            0,
            $store.canvas_data.width ?? 0,
            $store.canvas_data.height ?? 0,
        );
        const colorsOffset = 4; // RGBA
        const rx = x * colorsOffset;
        const ry = y * ($store.canvas_data.width ?? 0) * colorsOffset;
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
    let canvasOffsetTop = $derived($appStore.headerHeight);
    $effect(() => {
        if (width && height) {
            updateCanvasSize(width, height);
        }
    });
</script>

{#if preview}
    <div
        bind:clientWidth={width}
        bind:clientHeight={height}
        class="overflow-hidden"
    >
        <canvas class="rounded-md" bind:this={elemCanvas} height="90px"
        ></canvas>
    </div>

    <PiecesManager
        bind:this={piecesManager}
        updatedPiece={() => 0}
        removedPiece={() => 0}
    />
{:else}
    <Cursors {cursors} />

    <div class="canvas-component">
        <ControlPanel
            {saveIsLoading}
            setActiveMode={(v: CanvasModes) => setActiveMode(v)}
            action={(v: CanvasActions) => action(v)}
            updatedBackgroundColor={draw}
            updatedCanvasData={websocketUpdatedCanvasData}
            save={saveCanvas}
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
                width="{$store.canvas_data.width}px"
                height="{$store.canvas_data.height}px"
                onmousedown={(e) => setMouseDown(e, true)}
                onmouseup={(e) => setMouseDown(e, false)}
                onmouseleave={(e) => setMouseDown(e, false)}
                onmousemove={(e) => setMousePos(e)}
            ></canvas>
        </div>

        <PiecesManager
            bind:this={piecesManager}
            updatedPiece={(v: Piece) => websocketUpdatePiece(v)}
            removedPiece={(v: PieceSerialized) => websocketRemovePiece(v)}
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
