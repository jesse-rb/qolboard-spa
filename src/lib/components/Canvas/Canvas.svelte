<script lang="ts">
    import { SvelteComponent, onMount, setContext, tick } from "svelte";
    import PiecesManager from "./PiecesManager.svelte";
    import ControlPanel from "./ControlPanel.svelte";
    import Ruler from "./Ruler.svelte";
    import { store } from "./store";
    import { CanvasModes } from "./enums/modes";
    import type { CanvasSerialized } from "./types/canvas";
    import type { CanvasActions } from "./enums/actions";

    let elemContaienr:HTMLDivElement;
    let elemCanvas:HTMLCanvasElement;
    
    let piecesManager:SvelteComponent;
    
    let keyDown:string|null = null;
    
    let overiddenActiveMode:CanvasModes|null;
    
    const canvasOffset = 300;
    
    setContext('canvasStore', store);
    setContext('saveToSessionStorage', saveToSessionStorage);

    onMount(async () => {
        // Init canvas context
        const _ctx = elemCanvas.getContext('2d');
        if (_ctx) {
            $store.ctx = _ctx;
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
        window.addEventListener("wheel", (e) => {
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

            $store.xPan += dx;
            $store.yPan += dy;
            piecesManager.pan(dx, dy);
            draw();
            saveToSessionStorage();
        });
        updateCanvasSize();

        // Initial draw
        await tick();
        $store.ctx.scale($store.zoom, $store.zoom);
        
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
        $store.ctx = elemCanvas.getContext('2d');
        await piecesManager.deserialize(s.piecesManager);
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

    function updateCanvasSize() {
        let box = elemContaienr.getBoundingClientRect();
        if (box) {
            $store.width = box.width;
            $store.height = box.height;
            draw();
        }
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

        saveToSessionStorage();
    }

    function setMousePos(e:MouseEvent) {
        const canvasOffsetLeft = elemCanvas.offsetLeft;
        const canvasOffsetTop = elemCanvas.offsetTop;
        const scrollOffsetX = document.documentElement.scrollLeft;
        const scrollOffsetY = document.documentElement.scrollTop;
        $store.prevMouseX = $store.mouseX;
        $store.prevMouseY = $store.mouseY;

        $store.mouseX = e.clientX - canvasOffsetLeft + scrollOffsetX;
        $store.mouseY = e.clientY - canvasOffsetTop + scrollOffsetY - canvasOffset; // subtract canvas absolute top offset

        $store.mouseX = $store.mouseX/$store.zoom;
        $store.mouseY = $store.mouseY/$store.zoom;

        if ($store.activeMode == CanvasModes.Draw && $store.mouseDown) {
            piecesManager.addPointToLatestPiece();
            saveToSessionStorage();
        }

        if ($store.activeMode == CanvasModes.Grab && $store.mouseDown) {
            if (piecesManager.getSelected()) {
                piecesManager.move();
                saveToSessionStorage();
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
            saveToSessionStorage();
        }

        if ($store.activeMode == CanvasModes.Remove && $store.mouseDown) {
            piecesManager.select();
            piecesManager.remove();
            saveToSessionStorage();
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
            saveToSessionStorage();
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

<div class="canvas-component">
    <div bind:this={elemContaienr} class="canvas-container absolute right-0 bottom-0 left-0 -z-10" >
        <canvas
            class="absolute hover:cursor-crosshair"
            bind:this={elemCanvas}
            width="{$store.width}px"
            height="{$store.height}px"
            on:mousedown={(e)=>setMouseDown(e, true)}
            on:mouseup={(e)=>setMouseDown(e, false)} 
            on:mouseleave={(e)=>setMouseDown(e, false)} 
            on:mousemove={(e)=>setMousePos(e)} />
    </div>

    <PiecesManager bind:this={piecesManager} />

    <ControlPanel
        on:setActiveMode={(e)=>setActiveMode(e.detail)}
        on:action={(e)=>action(e.detail)}
        on:updatedBackgroundColor={draw}
    />

    <Ruler />
</div>

<style>
    .canvas-container {
        top: var(--canvas-offset);
    }
</style>
