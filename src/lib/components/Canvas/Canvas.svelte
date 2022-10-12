<script>
    import { onMount, tick } from "svelte";

    let elemContaienr;
    let elemCanvas;
    let ctx;

    let backgroundColor = '#30303f';
    let width = 0;
    let height = 0;

    onMount(()=>{
        let elemContainerResizeObserver = new ResizeObserver(updateCanvasSize).observe(elemContaienr);

        // Init canvas context
        ctx = elemCanvas.getContext('2d');
        updateCanvasSize();
    });

    async function draw() {
        await tick(); // If DOM falls behind... await tick();
        updateBackgroundColor();
    }

    function updateBackgroundColor() {
        // Init canvas background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
    }

    function updateCanvasSize() {
        let box = elemContaienr.getBoundingClientRect();
        width = box.width-10;
        height = box.height-10;
        draw();
    }
</script>

<div bind:this={elemContaienr} class="canvas-container">
    <canvas bind:this={elemCanvas} width="{width}px" height="{height}px" />
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