<script>
    import { getContext, createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    export let size = 5;
    export let color = '#af8a8a';
    export let selected = false;

    const canvasStore = getContext('canvasStore');

    let path = new Path2D();
    let lowest;
    let highest;
    let leftMost;
    let rightMost;

    const ctx = $canvasStore.ctx;

    export function isPointInPath() {
        const x = $canvasStore.mouseX;
        const y = $canvasStore.mouseY;
        return ctx.isPointInPath(path, x, y);
    }

    export function draw() {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'bevel';
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.shadowColor = color;
        ctx.shadowBlur = 0;
        if (selected) {
            ctx.strokeStyle = '#FF0000';
        }
            
        ctx.stroke(path);
    }

    export function addPoint() {
        let mouseX = $canvasStore.mouseX;
        let mouseY = $canvasStore.mouseY;
        console.log('event: adding point');
        path.lineTo(mouseX, mouseY);
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

        let m = new DOMMatrix();
        m.translateSelf(dx, dy);

        let updatedPath = new Path2D();
        updatedPath.addPath(path, m);
        path = updatedPath;
    }
</script>
