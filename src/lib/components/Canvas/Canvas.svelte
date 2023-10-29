<script>
    import { onMount, setContext, tick } from "svelte";
    import { writable } from "svelte/store";
    import PiecesManager from "./PiecesManager.svelte";
    import ControlPanel from "./ControlPanel.svelte";
    import { space } from "svelte/internal";

    let width = 100;
    let height = 100;
    let elemContaienr;
    let elemCanvas;
    let ctx;

    let piecesManager = null;

    let keyDown = null;

    let mouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let activeMode = 'draw';
    let overiddenActiveMode = null;

    let pieceSettings = {
        size: 10,
        color: '#D55C1A',
        resX: 1,
        resY: 1
    };

    const store = writable({
        activeMode:activeMode,
        mouseDown:false,
        mouseX:0,
        mouseY:0,
        prevMouseX:0,
        prevMouseY:0,
        ctx: ctx,
        backgroundColor: '#1A1A1A',
        pieceSettings: pieceSettings
    });
    setContext('canvasStore', store);

    $: $store.activeMode = activeMode;
    $: $store.mouseDown = mouseDown;
    $: $store.mouseX = mouseX;
    $: $store.mouseY = mouseY;
    $: $store.prevMouseX = prevMouseX;
    $: $store.prevMouseY = prevMouseY;
    $: $store.ctx = ctx;
    $: $store.pieceSettings = pieceSettings;

    // Draw mode
    $: if (activeMode == 'draw') {
        piecesManager && piecesManager.deselect();
    }

    $: if (activeMode == 'draw' && mouseDown) {
        piecesManager.addPiece();
    }

    $: if (activeMode == 'draw' && (mouseDown && (mouseX || mouseY))) {
        piecesManager.addPointToLatestPiece();
        saveToSessionStorage();
    }

    // Move mode
    $: if (activeMode == 'grab' && mouseDown) {
        piecesManager.select();
    }

    $: if (activeMode == 'grab' && (mouseDown && (mouseX || mouseY))) {
        if (piecesManager.getSelected()) {
            piecesManager.move();
            saveToSessionStorage();
        }
        else {
            piecesManager.select();
        }
    }

    // Pan mode
    $: if (activeMode == 'pan') {
        piecesManager.deselect();
    }

    $: if (activeMode == 'pan' && (mouseDown && (mouseX || mouseY))) {
        piecesManager.pan();
        updateBackgroundColor();
        piecesManager.draw();
    }

    // Delete mode
    $: if (activeMode == 'remove') {
        piecesManager.deselect();
    }
    $: if (activeMode == 'remove' && (mouseDown && (mouseX || mouseY))) {
        piecesManager.select();
        piecesManager.remove();
    }

    $: backroundColor = $store.backgroundColor;
    $: backroundColor && draw();

    onMount(async () => {
        let elemContainerResizeObserver = new ResizeObserver(updateCanvasSize).observe(elemContaienr);

        // Init canvas context
        ctx = elemCanvas.getContext('2d');

        // Init global event listeners for things such as keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            const key = e.key;

            // Register keydown keyboard shortcuts
            if (keyDown === null) {
                keyDown = key;
                console.log(`keypress: ${key}`);
                if (key === ' ') {
                    overiddenActiveMode = activeMode;
                    activeMode = 'pan';
                }
            }
        });
        window.addEventListener('keyup', (e) => {
            const key = e.key;

            // Register keyup keyboard shortcuts
            console.log(`keyup: ${key}`);
            if (key === ' ') {
                activeMode = overiddenActiveMode;
                overiddenActiveMode = null;
                console.log(activeMode);
            }

            keyDown = null;
        });

        await restoreFromSessionStorage();

        // Initial draw
        draw();
    });

    async function saveToSessionStorage() {
        await tick();
        window.sessionStorage.setItem('canvas', JSON.stringify(serialize()));
    }

    async function restoreFromSessionStorage() {
        // Restore canvas state from session storage
        const state = JSON.parse(window.sessionStorage.getItem('canvas'));
        if (state !== null) {
            await deserialize(state);
        }
    }

    function serialize() {
        const s = {
            store: $store,
            piecesManager: piecesManager.serialize()
        }
        return s;
    }

    async function deserialize(s) {
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
        ctx.fillRect(0, 0, width, height);
    }

    function updateCanvasSize() {
        let box = elemContaienr.getBoundingClientRect();
        if (box) {
            width = box.width;
            height = box.height;
            draw();
        }
    }

    function setMouseDown(e, _mouseDown) {
        e.preventDefault();
        mouseDown = _mouseDown;
    }

    function setMousePos(e) {
        const canvasOffsetLeft = elemCanvas.offsetLeft;
        const canvasOffsetTop = elemCanvas.offsetTop;
        const scrollOffsetX = document.documentElement.scrollLeft;
        const scrollOffsetY = document.documentElement.scrollTop;
        prevMouseX = mouseX;
        prevMouseY = mouseY;
        mouseX = e.clientX - canvasOffsetLeft + scrollOffsetX;
        mouseY = e.clientY - canvasOffsetTop + scrollOffsetY - 200; // subtract canvas absolute top offset

    }

    function setActiveMode(mode) {
        activeMode = mode;
    }

    function action(action) {
        if (action === 'clear') {
            piecesManager.clear();
            draw();
        }
    }

    // Get rgba of pixel at coord (or set)
    function coord(x, y, rgba, set=false) {
        let imageData = ctx.getImageData();
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
    <div bind:this={elemContaienr} class="canvas-container" >
        <canvas
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
</div>

<style>
    .canvas-container {
        position: absolute;
        top: var(--canvas-offset);
        right: 0;
        bottom: 0;
        left: 0;
        z-index: -1;
    }
    canvas {
        position: absolute;
    }
    canvas:hover {
        cursor: crosshair;
    }
</style>
