<script>
    import { getContext } from "svelte";

    const canvasSotre = getContext('canvasStore');

    let points = [];
    let size = 1;
    let color = '#af8a8a';

    export function draw() {
        if (!$canvasSotre.ctx) {
            return;
        }
        $canvasSotre.ctx.fillStyle = color;
        for (let i = 0; i < points.length; i+=2) {
            const x = points[i];
            const y = points[i+1];
            $canvasSotre.ctx.fillRect(x, y, size, size);
        }
    }

    export function addPoint() {
        console.log('adding point');
        points = [...points, $canvasSotre.mouseX, $canvasSotre.mouseY];
    }

    export function getPoints() {
        return points;
    }
</script>