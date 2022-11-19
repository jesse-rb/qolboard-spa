<script>
    import { onMount, setContext, tick } from "svelte";
    import { writable } from "svelte/store";
    import PiecesManager from "./PiecesManager.svelte";
    import ControlPanel from "./ControlPanel.svelte";
  import Piece from "./Piece.svelte";

    const modes = {
        draw: 'draw',
        select: 'select'
    }

    let activeMode = 'draw';

    let elemContaienr;
    let elemCanvas;
    let ctx;

    let piecesManager = null;

    let backgroundColor = '#30303f';
    let width = 100;
    let height = 100;
    let mouseDown = false;
    let mouseX = 0;
    let mouseY = 0;

    let fps = 0;
    let framesDone = 0;

    const store = writable({activeMode:'', mouseDown:false, mouseX:0, mouseY:0, ctx: ctx});
    setContext('canvasStore', store);

    $: $store.activeMode = activeMode;
    $: $store.mouseDown = mouseDown;
    $: $store.mouseX = mouseX;
    $: $store.mouseY = mouseY;
    $: $store.ctx = ctx;

    $: if (mouseDown) {
        piecesManager.addPiece();
    }

    $: if (mouseDown && (mouseX || mouseY)) {
        piecesManager.addPointToLatestPiece();
    }

    onMount(()=>{
        let elemContainerResizeObserver = new ResizeObserver(updateCanvasSize).observe(elemContaienr);

        // Init canvas context
        ctx = elemCanvas.getContext('2d');

        loop();
        updateFPS();
    });

    async function loop() {
        await draw();
        framesDone++;
        setTimeout(loop, 0);
    }

    async function draw() {
        await tick(); // If DOM falls behind... await tick();
        updateBackgroundColor();
        piecesManager.draw();
        // updatePieces();
    }

    // Update fps
    function updateFPS() {
        fps = framesDone;
        framesDone = 0; 
        setTimeout(updateFPS, 1000);
    }

    function updateBackgroundColor() {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
    }

    function updateCanvasSize() {
        let box = elemContaienr.getBoundingClientRect();
        width = box.width-10;
        height = box.height-10;
        draw();
    }

    function setMouseDown(e, _mouseDown) {
        e.preventDefault();
        mouseDown = _mouseDown;
    }

    function setMousePos(e) {
        const canvasOffsetLeft = elemCanvas.offsetLeft;
        const canvasOffsetTop = elemCanvas.offsetTop
        mouseX = e.clientX - canvasOffsetLeft;
        mouseY = e.clientY - canvasOffsetTop;
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

<ControlPanel />
<span>fps: {fps}</span>
<div bind:this={elemContaienr} class="canvas-container" >
    <canvas
        bind:this={elemCanvas}
        width="{width}px"
        height="{height}px"
        on:mousedown={(e)=>setMouseDown(e, true)}
        on:mouseup={(e)=>setMouseDown(e, false)} 
        on:mouseleave={(e)=>setMouseDown(e, false)} 
        on:mousemove={(e)=>setMousePos(e)} />
        <PiecesManager bind:this={piecesManager} />
</div>

<style>
    .canvas-container {
        margin: 30px;
        resize: both;
        overflow: auto;
        width: 100px;
        height: 100px;
    }
    canvas {
        border: 1px solid var(--color-back-3);
    }
</style>