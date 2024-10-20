<script lang="ts">
    import { SvelteComponent, onMount, setContext, tick } from "svelte";
    import PiecesManager from "./PiecesManager.svelte";
    import ControlPanel from "./ControlPanel.svelte";
    import Ruler from "./Ruler.svelte";
    import { CanvasModes } from "./enums/modes";
    import type { Canvas, CanvasData, CanvasStore } from "./types/canvas";
    import type { CanvasActions } from "./enums/actions";
    import { appStore } from "../../store";
    import { pushState } from "$app/navigation";
    import { writable, type Writable } from "svelte/store";

    export let id:number|null = null;
    export let preview:boolean = false;

    let elemContaienr:HTMLDivElement;
    let elemCanvas:HTMLCanvasElement;
    
    let piecesManager:PiecesManager;
    
    let keyDown:string|null = null;
    
    let overiddenActiveMode:CanvasModes|null;
    
    let width:number;
    let height:number;

    let saveIsLoading = false;
    
    // Allow each canvas instance to have it's own separate store instance (not a shared store)
    const store:Writable<CanvasStore> = writable({
        ctx: null,
        id: null,
        name: "A blank canvas",
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
    setContext('canvasStore', store);

    $: canvasOffsetTop = $appStore.headerHeight;
    $: canvasOffsetLeft = $appStore.controlPanelWidth;

    $: if (width && height) {
        updateCanvasSize(width, height);
    }

    onMount(async () => {
        // Init canvas context
        const _ctx = elemCanvas.getContext('2d');
        if (_ctx !== null) {
            $store.ctx = _ctx;
        }
        else {
            throw new Error('2D canvas rendering context is not available');
        }
        
        if (id !== null) {
            const canvas = await getCanvas(id);
            if (canvas) {
                await deserialize(canvas);
            }
        }

        if (!preview) {
            // Init global event listeners for things such as keyboard shortcuts
            window.addEventListener('keydown', (e) => {
                const key = e.key;

                // Register keydown keyboard shortcuts
                if (keyDown === null) {
                    keyDown = key;
                    console.log(`keypress: ${key}`);
                    if (key === ' ') {
                        overiddenActiveMode = $store.activeMode;
                        setActiveMode(CanvasModes.Pan);
                    }
                }
            });
            window.addEventListener('keyup', (e) => {
                const key = e.key;

                // Register keyup keyboard shortcuts
                console.log(`keyup: ${key}`);
                if (key === ' ') {
                    if (overiddenActiveMode) {
                        setActiveMode(overiddenActiveMode);
                    }
                    overiddenActiveMode = null;
                    $store.mouseDown = false;
                }

                keyDown = null;
            });
            elemCanvas.addEventListener("wheel", (e) => {
                const wheelDeltaY = e.deltaY;
                const zoom = wheelDeltaY < 0 ? 100/99 : 99/100; // Once again the answer was in the original qolboard codebase. Not falling for ? 1.05 : 0.95 again! lol >:(
                $store.ctx?.scale(zoom, zoom);

                const oldZoom = $store.zoom;
                $store.zoom = $store.zoom * zoom;

                // Pan according to zoom, to center canvas after zoom
                let dx = Math.abs($store.width/$store.zoom-$store.width/oldZoom)/2;
                let dy = Math.abs($store.height/$store.zoom-$store.height/oldZoom)/2;

                dx = dx * (wheelDeltaY > 0 ? 1 : -1);
                dy = dy * (wheelDeltaY > 0 ? 1 : -1);

                $store.zoomDx += dx;
                $store.zoomDy += dy;

                piecesManager.pan(dx, dy);
                draw();
            });
        }

        // Initial draw
        await tick();
        if (preview) {
            $store.zoom *= 0.1;
        }
        $store.ctx.scale($store.zoom, $store.zoom);
        
        await draw();
    });

    async function saveCanvas() {
        saveIsLoading = true;

        const domain = import.meta.env.VITE_API_HOST;
        let path = "user/canvas";
        if (id !== null) {
            path = `${path}/${id}`;
        }
        console.log(path);
        const url = `${domain}/${path}`;

        const body = serialize();

        const response = await fetch(url, {
            method: "POST",
            credentials: "include",
            body: JSON.stringify(body),
            headers: {
                "content-type": "application/json"
            }
        });

        if (response.ok) {
            if (id === null) {
                const body:{msg:string, canvas:Canvas} = await response.json();
                id = body.canvas.id;
                pushState(`/canvas/${id}`, {});
            }
        }

        saveIsLoading = false;
    }

    async function getCanvas(id: number):Promise<Canvas|null> {
        // loading = true;

        const domain = import.meta.env.VITE_API_HOST;
        const path = `user/canvas/${id}`;
        const url = `${domain}/${path}`;

        const response = await fetch(url, {
            method: "GET",
            credentials: "include",
            headers: {
                "content-type": "application/json"
            }
        });

        if (response.ok) {
            const canvas:Canvas = await response.json();
            return canvas;
        }

        // loading = false;

        return null;
    }
    
    function serialize() {
        const s:CanvasData = {
            id: $store.id,
            name: $store.name,
            activeMode: $store.activeMode,
            backgroundColor: $store.backgroundColor,
            mouseX: $store.mouseX,
            mouseY: $store.mouseY,
            mouseDown: $store.mouseDown,
            prevMouseX: $store.prevMouseX,
            prevMouseY: $store.prevMouseY,
            xPan: $store.xPan,
            yPan: $store.yPan,
            zoom: $store.zoom,
            zoomDx: $store.zoomDx,
            zoomDy: $store.zoomDy,
            snapToGrid: $store.snapToGrid,
            rulerSettings: $store.rulerSettings,
            pieceSettings: $store.pieceSettings,
            piecesManager: piecesManager.serialize()
        }

        return s;
    }

    async function deserialize(canvas:Canvas) {
        id = canvas.id;

        const canvasData = canvas.canvasData;
        $store.id = id;
        $store.name = canvasData.name;
        $store.activeMode = canvasData.activeMode;
        $store.activeMode = canvasData.activeMode;
        $store.backgroundColor = canvasData.backgroundColor;
        $store.mouseX = canvasData.mouseX;
        $store.mouseY = canvasData.mouseY;
        $store.mouseDown = canvasData.mouseDown;
        $store.prevMouseX = canvasData.prevMouseX;
        $store.prevMouseY = canvasData.prevMouseY;
        $store.xPan = canvasData.xPan;
        $store.yPan = canvasData.yPan;
        $store.zoom = canvasData.zoom;
        $store.zoomDx = canvasData.zoomDx;
        $store.zoomDy = canvasData.zoomDy;
        $store.snapToGrid = canvasData.snapToGrid;
        $store.pieceSettings = canvasData.pieceSettings;

        await piecesManager.deserialize(canvasData.piecesManager);
    }

    async function draw() {
        if ($store.ctx !== null) {
            await tick(); // If DOM falls behind... await tick();
            updateBackgroundColor();
            piecesManager.draw();
        }
    }

    function updateBackgroundColor() {
        if ($store.ctx !== null) {
            $store.ctx.fillStyle = $store.backgroundColor;
            $store.ctx.fillRect(0, 0, $store.width/$store.zoom, $store.height/$store.zoom);
        }
    }

    async function updateCanvasSize(width:number, height:number) {
        $store.width = width;
        $store.height = height;
        await tick();
        $store.ctx?.scale($store.zoom, $store.zoom);
        draw();
    }

    function setMouseDown(e:MouseEvent, _mouseDown:boolean) {
        e.preventDefault();
        $store.mouseDown = _mouseDown;
        
        if ($store.activeMode === CanvasModes.Draw && $store.mouseDown) {
            piecesManager.addPiece();
        }

        if ($store.activeMode === CanvasModes.Grab && $store.mouseDown) {
            piecesManager.select();
        }
    }

    function setMousePos(e:MouseEvent) {
        const _canvasOffsetLeft = elemCanvas.offsetLeft;
        const _canvasOffsetTop = elemCanvas.offsetTop;
        const scrollOffsetX = document.documentElement.scrollLeft;
        const scrollOffsetY = document.documentElement.scrollTop;
        $store.prevMouseX = $store.mouseX;
        $store.prevMouseY = $store.mouseY;

        $store.mouseX = e.clientX - _canvasOffsetLeft + scrollOffsetX;
        $store.mouseY = e.clientY - _canvasOffsetTop + scrollOffsetY - canvasOffsetTop; // subtract canvas absolute top offset

        $store.mouseX = Math.round($store.mouseX/$store.zoom);
        $store.mouseY = Math.round($store.mouseY/$store.zoom);

        if ($store.activeMode == CanvasModes.Draw && $store.mouseDown) {
            piecesManager.addPointToLatestPiece();
        }

        if ($store.activeMode == CanvasModes.Grab && $store.mouseDown) {
            if (piecesManager.getSelected()) {
                piecesManager.move();
            }
            else {
                piecesManager.select();
            }
        }

        if ($store.activeMode == CanvasModes.Pan && $store.mouseDown) {
            piecesManager.pan();
            updateBackgroundColor();
            piecesManager.draw();
            $store.xPan += $store.mouseX - $store.prevMouseX;
            $store.yPan += $store.mouseY - $store.prevMouseY;
        }

        if ($store.activeMode == CanvasModes.Remove && $store.mouseDown) {
            piecesManager.select();
            piecesManager.remove();
        }
    }

    function setActiveMode(mode:CanvasModes) {
        $store.activeMode = mode;
        piecesManager && piecesManager.deselect();
    }

    function action(action:CanvasActions) {
        if (action === 'clear') {
            piecesManager.clear();
            draw();
        }
    }

    // Get or set rgba value of pixel at given coordinates
    function coord(x:number, y:number, rgba:Array<number>, set:boolean=false): Array<number> {
        let imageData = $store.ctx?.getImageData(0, 0, $store.width, $store.height);
        const colorsOffset = 4; // RGBA
        const rx = x*colorsOffset;
        const ry = y*$store.width*colorsOffset;
        const _rgba = [];
        if (imageData) {
            for (let i = 0; i < colorsOffset; i++) {
                if (set) {
                    imageData.data[rx+ry+i] = rgba[i];
                }
                _rgba.push(imageData.data[rx+ry+i]);
            }
        }
        return _rgba;
    }
</script>

{#if preview}
    <div bind:clientWidth={width} bind:clientHeight={height}>
        <canvas
            class="rounded-md"
            bind:this={elemCanvas}
            height="90px"
        />
    </div>

    <PiecesManager bind:this={piecesManager} />
{:else}
    <div class="canvas-component">

        <ControlPanel
            saveIsLoading={saveIsLoading}
            on:setActiveMode={(e)=>setActiveMode(e.detail)}
            on:action={(e)=>action(e.detail)}
            on:updatedBackgroundColor={draw}
            on:save={saveCanvas}
        />

        <div bind:clientWidth={width} bind:clientHeight={height} bind:this={elemContaienr} class="canvas-container absolute right-0 bottom-0 left-0 -z-10" >
            <canvas
                class="absolute hover:cursor-crosshair"
                bind:this={elemCanvas}
                width="{$store.width}px"
                height="{$store.height}px"
                on:mousedown={(e)=>setMouseDown(e, true)}
                on:mouseup={(e)=>setMouseDown(e, false)} 
                on:mouseleave={(e)=>setMouseDown(e, false)} 
                on:mousemove={(e)=>setMousePos(e)}
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
