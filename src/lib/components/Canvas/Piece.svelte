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
        ctx.lineJoin = reset ? '' : 'round';
        ctx.strokeStyle = reset ? $canvasStore.backgroundColor : settings.color;
        ctx.lineWidth = reset ? 1 : settings.size;
    }

    function updateBoundingBox(x, y) {
        leftMost = leftMost < x ? leftMost : x;
        rightMost = rightMost > x ? rightMost : x;
        topMost = topMost < y ? topMost : y;
        bottomMost = bottomMost > y ? bottomMost : y;
    }

    export function isPointInStroke(x, y) {
        setDrawSettings();
        return ctx.isPointInStroke(path, x, y);
    }

    export function doesBoundingBoxOverlap(p) {
        const [x, y, width, height] = getBoundingBox();
        const [_x, _y, _width, _height] = p.getBoundingBox();

        const xOverlap = (x < _x+_width) && (x+width > _x);
        const yOverlap = (y < _y+_height) && (y+height > _y);

        return xOverlap && yOverlap;
    }

    export function draw(p=null) {
        if (!p) {
            p = path;
        }
        setDrawSettings();
        ctx.stroke(p);
        if (selected) {
            drawBoundingBoxBorder();
        }
    }

    export function getBoundingBox() {
        const clearMargin = (settings.size);

        const x = leftMost-clearMargin;
        const y = topMost-clearMargin;

        const width = (rightMost-leftMost)+clearMargin*2;
        const height = (bottomMost-topMost)+clearMargin*2;

        return [x, y, width, height];
    }

    export function clearBoundingBox() {
        const [x, y, width, height] = getBoundingBox();

        setDrawSettings(true);
        ctx.fillRect(x, y, width, height);
    }

    export function drawBoundingBoxBorder() {
        const clearMargin = 1;
        const [x, y, width, height] = getBoundingBox();
        ctx.beginPath();
        setDrawSettings(true);
        ctx.strokeStyle = '#FFFFFF';
        ctx.rect(x+clearMargin, y+clearMargin, width-(clearMargin*2), height-(clearMargin*2));
        ctx.closePath();
        ctx.stroke();
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

            const addedPath = new Path2D();
            addedPath.moveTo(latestPointX, latestPointY);
            addedPath.lineTo(newX, newY);
            draw(addedPath);
            
            latestPointX = newX;
            latestPointY = newY;
        }

        return [newX, newY];
    }

    export function close() {
        path.closePath();
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

        leftMost += dx;
        rightMost += dx;
        topMost += dy;
        bottomMost += dy;

        let updatedPath = new Path2D();
        updatedPath.addPath(path, m);
        path = updatedPath;
    }
</script>
