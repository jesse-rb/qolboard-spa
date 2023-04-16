<script>
    import { getContext } from "svelte";

    export let settings = {};
    export let selected = false;

    const canvasStore = getContext('canvasStore');

    let path = new Path2D();

    let latestPointX = $canvasStore.mouseX;
    let latestPointY = $canvasStore.mouseY;

    let leftMost;
    let rightMost;
    let topMost;
    let bottomMost;

    const ctx = $canvasStore.ctx;

    function setDrawSettings(reset=false) {
        ctx.lineCap = reset ? '' : 'round';
        ctx.lineJoin = reset ? '' : 'bevel';
        ctx.strokeStyle = reset ? $canvasStore.backgroundColor : settings.color;
        ctx.lineWidth = reset ? 1 : settings.size;
        ctx.shadowColor = reset ? $canvasStore.backgroundColor : settings.shadowColor;
        ctx.shadowBlur = reset ? 0 : settings.shadowSize;
        if (selected) {
            ctx.strokeStyle = '#FF0000';
        }
    }

    function updateBoundingBox(x, y) {
        leftMost = leftMost < x ? leftMost : x;
        rightMost = rightMost > x ? rightMost : x;
        topMost = topMost < y ? topMost : y;
        bottomMost = bottomMost > y ? bottomMost : y;
        console.log()
    }

    export function isPointInStroke(x, y) {
        setDrawSettings();
        return ctx.isPointInStroke(path, x, y);
    }


    export function draw(p=null) {
        if (!p) {
            p = path;
        }
        setDrawSettings();
        ctx.stroke(p);
    }

    export function drawBoundingBox() {
        const clearMargin = (settings.shadowSize+settings.size)*1.1;

        const x = leftMost-clearMargin;
        const y = topMost-clearMargin;

        const width = (rightMost-leftMost)+clearMargin*2;
        const height = (bottomMost-topMost)+clearMargin*2;

        console.log((rightMost-leftMost), width)

        setDrawSettings(true);
        ctx.fillRect(x, y, width, height);

        ctx.strokeStyle = '#FFFFFF';
        ctx.rect(x, y, width, height);

        setDrawSettings();
        draw();
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
            updateBoundingBox(newX, newY);
            drawBoundingBox();
            
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

<div>
    <span>Piece</span>
</div>

<style>

</style>
