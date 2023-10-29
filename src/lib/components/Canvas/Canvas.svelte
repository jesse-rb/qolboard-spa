<script>
    import { onMount, setContext, tick } from "svelte";
    import { writable } from "svelte/store";
    import PiecesManager from "./PiecesManager.svelte";
    import ControlPanel from "./ControlPanel.svelte";

    let width = 100;
    let height = 100;
    let elemContaienr;
    let elemCanvas;
    let ctx;

    let piecesManager = null;

    let mouseDown = false;
    let mouseX = 0;
    let mouseY = 0;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let activeMode = 'draw';

    let pieceSettings = {
        size: 5,
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
    $: if (activeMode == 'draw' && mouseDown) {
        piecesManager.addPiece();
    }

    $: if (activeMode == 'draw' && (mouseDown && (mouseX || mouseY))) {
        piecesManager.addPointToLatestPiece();
    }

    // Move mode
    $: if (activeMode == 'grab' && mouseDown) {
        piecesManager.select();
    }

    $: if (activeMode == 'grab' && (mouseDown && (mouseX || mouseY))) {
        if (piecesManager.getSelected()) {
            piecesManager.move();
        }
        else {
            piecesManager.select();
        }
    }

    // Delete mode
    $: if (activeMode == 'remove' && (mouseDown && (mouseX || mouseY))) {
        piecesManager.select();
        piecesManager.remove();
    }

    $: backroundColor = $store.backgroundColor;
    $: backroundColor && draw();

    onMount(() => {
        let elemContainerResizeObserver = new ResizeObserver(updateCanvasSize).observe(elemContaienr);

        // Init canvas context
        ctx = elemCanvas.getContext('2d');
        draw();
    });

    async function draw() {
        await tick(); // If DOM falls behind... await tick();

        updateBackgroundColor();
        piecesManager.draw();

        // window.requestAnimationFrame(draw);
    }

    function updateBackgroundColor() {
        ctx.fillStyle = $store.backgroundColor;
        ctx.fillRect(0, 0, width, height);
    }

    function updateCanvasSize() {
        console.log('event: updating canvas size')
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
        top: 200px;
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
