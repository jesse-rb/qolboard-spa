<script>
    import { getContext } from "svelte";

    export let settings = {};
    export let selected = false;

    const canvasStore = getContext('canvasStore');

    let path = new Path2D();
    let latestPointX = 0;
    let latestPointY = 0;

    const ctx = $canvasStore.ctx;

    export function isPointInPath() {
        const x = $canvasStore.mouseX;
        const y = $canvasStore.mouseY;
        return ctx.isPointInPath(path, x, y);
    }

    export function draw() {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'bevel';
        ctx.strokeStyle = settings.color;
        ctx.lineWidth = settings.size;
        ctx.shadowColor = settings.shadowColor;
        ctx.shadowBlur = settings.shadowSize;
        if (selected) {
            ctx.strokeStyle = '#FF0000';
        }
            
        ctx.stroke(path);
    }

    export function addPoint() {
        const mouseX = $canvasStore.mouseX;
        const mouseY = $canvasStore.mouseY;

        const resX = settings.resX;
        const resY = settings.resY;

        let thereIsChangeOnX = mouseX >= latestPointX+resX || mouseX <= latestPointX-resX;
        let thereIsChangeOnY = mouseY >= latestPointY+resY || mouseY <= latestPointY-resY;

        let newX = latestPointX;
        let newY = latestPointY;

        if (thereIsChangeOnX) {
            newX = mouseX;
        }
        if (thereIsChangeOnY) {
            newY = mouseY;
        }

        if (thereIsChangeOnX || thereIsChangeOnY) {
            console.log('event: adding point');

            path.lineTo(newX, newY);
            latestPointX = newX;
            latestPointY = newY;
        }
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
