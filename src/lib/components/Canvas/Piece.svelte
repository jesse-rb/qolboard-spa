<script>
    import { getContext } from "svelte";

    const canvasSotre = getContext('canvasStore');

    let points = [];
    let size = 5;
    let color = '#af8a8a';

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
        ctx.fillStyle = color;
        ctx.lineWidth = size;
        ctx.beginPath();
        for (let i = 0; i < points.length; i+=2) {
            const x = points[i];
            const y = points[i+1];
            const x1 = points[i+2];
            const y1 = points[i+3];
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x1, y1);
            
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
        }
        ctx.closePath();
    }

    export function addPoint() {
        console.log('adding point');
        points = [...points, $canvasSotre.mouseX, $canvasSotre.mouseY];
    }

    export function getPoints() {
        return points;
    }
</script>