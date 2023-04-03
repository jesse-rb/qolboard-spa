<script>
    import { getContext, createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let size = 5;
    export let color = '#af8a8a';
    export let selected = false;

    const canvasStore = getContext('canvasStore');

    let points = [];
    let lowest;
    let highest;
    let leftMost;
    let rightMost;

    const ctx = $canvasStore.ctx;

    export function drawSquares() {
        ctx.fillStyle = color;
        for (let i = 0; i < points.length; i+=2) {
            const x = points[i];
            const y = points[i+1];
            ctx.fillRect(x, y, size, size);
        }
    }

    export function draw() {
        if (selected) {
            drawBox();
        }
        ctx.lineCap = 'round';
        ctx.lineJoin = 'bevel';
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.shadowColor = color;
        ctx.shadowBlur = 0;
        
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

    export function drawBox() {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 5;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(leftMost, highest);
        ctx.lineTo(rightMost, highest);
        ctx.lineTo(rightMost, lowest);
        ctx.lineTo(leftMost, lowest);
        ctx.lineTo(leftMost, highest);

        ctx.stroke();
        ctx.closePath();
        console.log(leftMost, highest, rightMost, lowest);
    }

    export function addPoint() {
        let mouseX = $canvasStore.mouseX;
        let mouseY = $canvasStore.mouseY;
        console.log('event: adding point');
        points = [...points, mouseX, mouseY];

        // Update point details
        leftMost = leftMost && leftMost < mouseX ? leftMost : mouseX;
        rightMost = rightMost && rightMost > mouseX ? rightMost : mouseX;
        highest = highest && highest < mouseY ? highest : mouseY;
        lowest = lowest && lowest > mouseY ? lowest : mouseY;
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
        let mouseX = $canvasStore.mouseX;
        let mouseY = $canvasStore.mouseY;

        let prevMouseX = $canvasStore.prevMouseX;
        let prevMouseY = $canvasStore.prevMouseY;
        
        let dx = mouseX-prevMouseX;
        let dy = mouseY-prevMouseY;

        for (let i = 0; i < points.length; i+=2) {
            let x = points[i];
            let y = points[i+1];
            let newX = x += dx;
            let newY = y += dy;
            // Update x
            points[i] = newX;
            // Update y
            points[i+1] = newY;

            // Update points details
            leftMost = leftMost && leftMost == x ? newX : leftMost;
            rightMost = rightMost && rightMost == x ? newX : rightMost;
            highest = highest && highest < newY ? newY : highest;
            lowest = lowest && lowest > newY ? newY : lowest;

            dispatch('move', {oldX: x, oldY: y, x: newX, y: newY});
        }
    }
</script>
