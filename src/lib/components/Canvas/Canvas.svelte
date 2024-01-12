<script lang="ts">
    import { SvelteComponent, onMount, setContext, tick } from "svelte";
    import PiecesManager from "./PiecesManager.svelte";
    import ControlPanel from "./ControlPanel.svelte";
    import Ruler from "./Ruler.svelte";
    import { store } from "./store";
    import { CanvasModes } from "./enums/modes";
    import type { CanvasSerialized } from "./types/canvas";
    import type { CanvasActions } from "./enums/actions";

    let width:number = 100;
    let height:number = 100;
    let elemContaienr:HTMLDivElement;
    let elemCanvas:HTMLCanvasElement;
    let ctx:CanvasRenderingContext2D;

    let piecesManager:SvelteComponent;

    let keyDown:string|null;

    let mouseDown:boolean = false;
    let mouseX:number = 0;
    let mouseY:number = 0;
    let prevMouseX:number = 0;
    let prevMouseY:number = 0;
    let activeMode:CanvasModes = CanvasModes.Draw;
    let overiddenActiveMode:CanvasModes|null;

    let pieceSettings = {
        size: 10,
        color: '#D55C1A',
        resX: 1,
        resY: 1
    };

    const canvasOffset = 300;

    setContext('canvasStore', store);
    setContext('saveToSessionStorage', saveToSessionStorage);

    $: $store.width = width;
    $: $store.height = height;
    $: $store.activeMode = activeMode;
    $: $store.mouseDown = mouseDown;
    $: $store.mouseX = mouseX;
    $: $store.mouseY = mouseY;
    $: $store.prevMouseX = prevMouseX;
    $: $store.prevMouseY = prevMouseY;
    $: $store.ctx = ctx;
    $: $store.pieceSettings = pieceSettings;

    // Draw mode
    $: if (activeMode == CanvasModes.Draw) {
        piecesManager && piecesManager.deselect();
    }

    $: if (activeMode == CanvasModes.Draw && mouseDown) {
        piecesManager.addPiece();
    }

    $: if (activeMode == CanvasModes.Draw && (mouseDown && (mouseX || mouseY))) {
        piecesManager.addPointToLatestPiece();
        saveToSessionStorage();
    }

    // Move mode
    $: if (activeMode == CanvasModes.Grab && mouseDown) {
        piecesManager.select();
    }

    $: if (activeMode == CanvasModes.Grab && (mouseDown && (mouseX || mouseY))) {
        if (piecesManager.getSelected()) {
            piecesManager.move();
            saveToSessionStorage();
        }
        else {
            piecesManager.select();
        }
    }

    // Pan mode
    $: if (activeMode == CanvasModes.Pan) {
        piecesManager.deselect();
    }

    $: if (activeMode == CanvasModes.Pan && (mouseDown && (mouseX || mouseY))) {
        piecesManager.pan();
        updateBackgroundColor();
        piecesManager.draw();
        $store.xPan += $store.mouseX - $store.prevMouseX;
        saveToSessionStorage();
    }

    // Delete mode
    $: if (activeMode == CanvasModes.Remove) {
        piecesManager.deselect();
    }
    $: if (activeMode == CanvasModes.Remove && (mouseDown && (mouseX || mouseY))) {
        piecesManager.select();
        piecesManager.remove();
        saveToSessionStorage();
    }

    $: backroundColor = $store.backgroundColor;
    $: backroundColor && draw();

    onMount(async () => {
        // Init canvas context
        const _ctx = elemCanvas.getContext('2d');
        if (_ctx) {
            ctx = _ctx;
        }
        else {
            throw new Error('2D canvas rendering context is not available');
        }

        await restoreFromSessionStorage();

        // Init global event listeners for things such as keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            const key = e.key;

            // Register keydown keyboard shortcuts
            if (keyDown === null) {
                keyDown = key;
                console.log(`keypress: ${key}`);
                if (key === ' ') {
                    overiddenActiveMode = activeMode;
                    activeMode = CanvasModes.Pan;
                }
            }
        });
        window.addEventListener('keyup', (e) => {
            const key = e.key;

            // Register keyup keyboard shortcuts
            console.log(`keyup: ${key}`);
            if (key === ' ') {
                activeMode = overiddenActiveMode ?? activeMode;
                overiddenActiveMode = null;
                mouseDown = false;
            }

            keyDown = null;
        });
        window.addEventListener("wheel", (e) => {
            const wheelDeltaY = e.deltaY;
            const zoom = wheelDeltaY < 0 ? 100/99 : 99/100; // Once again the answer was in the original qolboard codebase. Not falling for ? 1.05 : 0.95 again! lol >:(
            ctx.scale(zoom, zoom);

            const oldZoom = $store.zoom;
            $store.zoom = parseFloat(($store.zoom * zoom).toFixed(2));

            // Pan according to zoom, to center canvas after zoom
            
            let dx = Math.abs(width/$store.zoom-width/oldZoom)/2;
            let dy = Math.abs(height/$store.zoom-height/oldZoom)/2;

            dx = dx * (wheelDeltaY > 0 ? 1 : -1);
            dy = dy * (wheelDeltaY > 0 ? 1 : -1);

            piecesManager.pan(dx, dy);
            draw();
            saveToSessionStorage();
        });
        updateCanvasSize();

        // Initial draw
        await tick();
        ctx.scale($store.zoom, $store.zoom);
        
        
        await draw();
    });

    function saveToSessionStorage() {
        window.sessionStorage.setItem('canvas', JSON.stringify(serialize()));
    }

    async function restoreFromSessionStorage() {
        // Restore canvas state from session storage
        const serializedStateString = window.sessionStorage.getItem('canvas');
        if (serializedStateString === null) {
            console.log('Canvas does not yet have a saved state!');
        }
        else {
            const state = JSON.parse(serializedStateString);
            if (state !== null) {
                await deserialize(state);
            }
        }
    }

    function serialize() {
        const s:CanvasSerialized = {
            store: $store,
            piecesManager: piecesManager.serialize()
        }
        return s;
    }

    async function deserialize(s:CanvasSerialized) {
        $store = s.store;
        activeMode = $store.activeMode;
        await piecesManager.deserialize(s.piecesManager);
    }

    async function draw() {
        await tick(); // If DOM falls behind... await tick();
        updateBackgroundColor();
        piecesManager.draw();
    }

    function updateBackgroundColor() {
        ctx.fillStyle = $store.backgroundColor;
        ctx.fillRect(0, 0, width/$store.zoom, height/$store.zoom);
    }

    function updateCanvasSize() {
        let box = elemContaienr.getBoundingClientRect();
        if (box) {
            width = box.width;
            height = box.height;
            draw();
        }
    }

    function setMouseDown(e:MouseEvent, _mouseDown:boolean) {
        e.preventDefault();
        mouseDown = _mouseDown;
    }

    function setMousePos(e:MouseEvent) {
        const canvasOffsetLeft = elemCanvas.offsetLeft;
        const canvasOffsetTop = elemCanvas.offsetTop;
        const scrollOffsetX = document.documentElement.scrollLeft;
        const scrollOffsetY = document.documentElement.scrollTop;
        prevMouseX = mouseX;
        prevMouseY = mouseY;

        mouseX = e.clientX - canvasOffsetLeft + scrollOffsetX;
        mouseY = e.clientY - canvasOffsetTop + scrollOffsetY - canvasOffset; // subtract canvas absolute top offset

        mouseX = mouseX/$store.zoom;
        mouseY = mouseY/$store.zoom;
    }

    function setActiveMode(mode:CanvasModes) {
        activeMode = mode;
    }

    function action(action:CanvasActions) {
        if (action === 'clear') {
            piecesManager.clear();
            draw();
            saveToSessionStorage();
        }
    }

    // Get or set rgba value of pixel at given coordinates
    function coord(x:number, y:number, rgba:Array<number>, set:boolean=false): Array<number> {
        let imageData = ctx.getImageData(0, 0, $store.width, $store.height);
        const colorsOffset = 4; // RGBA
        const rx = x*colorsOffset;
        const ry = y*width*colorsOffset;
        const _rgba = [];
        for (let i = 0; i < colorsOffset; i++) {
            if (set) {
                imageData.data[rx+ry+i] = rgba[i];
            }
            _rgba.push(imageData.data[rx+ry+i]);
        }
        return _rgba;
    }
</script>

<div class="canvas-component">
    <div bind:this={elemContaienr} class="canvas-container absolute right-0 bottom-0 left-0 -z-10" >
        <canvas
            class="absolute hover:cursor-crosshair"
            bind:this={elemCanvas}
            width="{width}px"
            height="{height}px"
            on:mousedown={(e)=>setMouseDown(e, true)}
            on:mouseup={(e)=>setMouseDown(e, false)} 
            on:mouseleave={(e)=>setMouseDown(e, false)} 
            on:mousemove={(e)=>setMousePos(e)} />
    </div>

    <PiecesManager bind:this={piecesManager} />

    <ControlPanel
        on:setActiveMode={(e)=>setActiveMode(e.detail)}
        on:action={(e)=>action(e.detail)}
    />

    <Ruler />
</div>

<style>
    .canvas-container {
        top: var(--canvas-offset);
    }
</style>
