<script>
    import { getContext, createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let size = 5;
    export let color = '#af8a8a';
    export let selected = false;

    const canvasSotre = getContext('canvasStore');

    let points = [];

    const ctx = $canvasSotre.ctx;

    export function drawSquares() {
        ctx.fillStyle = color;
        for (let i = 0; i < points.length; i+=2) {
            const x = points[i];
            const y = points[i+1];
            ctx.fillRect(x, y, size, size);
        }
    }

    export function draw() {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'bevel';
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.shadowColor = color;
        ctx.shadowBlur = 0;
        if (selected) {
            ctx.shadowColor = "red";
            ctx.shadowBlur = 5;
        }
        ctx.beginPath();
        for (let i = 0; i < points.length; i+=2) {
            const x = points[i];
            const y = points[i+1];
            const x1 = points[i+2];
            const y1 = points[i+3];
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x1, y1);
            
            ctx.stroke();
            ctx.closePath();
        }
        ctx.closePath();
    }

    export function addPoint() {
        console.log('event: adding point');
        points = [...points, $canvasSotre.mouseX, $canvasSotre.mouseY];
    }

    export function getPoints() {
        return points;
    }

    export function select() {
        selected = true;
    }

    export function deselect() {
        selected = false;
    }

    export function move() {
        let mouseX = $canvasSotre.mouseX;
        let mouseY = $canvasSotre.mouseY;
        let originX = points[0];
        let originY = points[1];
        for (let i = 0; i < points.length; i+=2) {
            let x = points[i];
            let y = points[i+1];
            let newX = mouseX+(x-originX);
            let newY = mouseY+(y-originY);
            // Update x
            points[i] = newX;
            // Update y
            points[i+1] = newY;

            dispatch('move', {oldX: x, oldY: y, x: newX, y: newY});
        }
    }
</script>