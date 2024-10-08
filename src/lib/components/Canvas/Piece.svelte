<script>
    import { createEventDispatcher, getContext } from "svelte";
    import { roundToTarget } from "../../util";

    export let settings = {};
    export let selected = false;

    const canvasStore = getContext('canvasStore');

    const dispatch = createEventDispatcher();
    const ctx = $canvasStore.ctx;
    
    let pathSVG = "";
    let moveMatrix = new DOMMatrix();
    let panMatrix = new DOMMatrix();
    let path = new Path2D();

    let latestPointX = $canvasStore.mouseX;
    let latestPointY = $canvasStore.mouseY;

    let leftMost;
    let rightMost;
    let topMost;
    let bottomMost;

    function dispatchUpdate(redrawPiece) {
        dispatch('update', redrawPiece);
    }

    function dispatchUpdateBoundingBox() {
        dispatch('updateBoundingBox', {topMost, rightMost, bottomMost, leftMost});
    }

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

        dispatchUpdateBoundingBox();
    }

    export function serialize() {
        const s = {
            settings: settings,
            path: pathSVG,
            move: moveMatrix.toJSON(),
            pan: panMatrix.toJSON(),
            leftMost: leftMost,
            rightMost: rightMost,
            topMost: topMost,
            bottomMost: bottomMost
        };

        return s;
    }

    export function deserialize(s) {
        settings = s.settings;

        pathSVG = s.path;
        path = new Path2D(s.path+"C");

        moveMatrix = DOMMatrix.fromMatrix(s.move);
        panMatrix = DOMMatrix.fromMatrix(s.pan);

        let updatedPath = new Path2D();
        updatedPath.addPath(path, moveMatrix);
        path = updatedPath;

        updatedPath = new Path2D()
        updatedPath.addPath(path, panMatrix);
        path = updatedPath;

        leftMost = s.leftMost;
        rightMost = s.rightMost;
        topMost = s.topMost;
        bottomMost = s.bottomMost;
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
        const clearMargin = 1/$canvasStore.zoom;
        const [x, y, width, height] = getBoundingBox();

        setDrawSettings(true);
        ctx.fillRect(x-clearMargin, y-clearMargin, width+(clearMargin*2), height+(clearMargin*2));
    }

    export function drawBoundingBoxBorder() {
        const clearMargin = 1/$canvasStore.zoom;
        const [x, y, width, height] = getBoundingBox();
        ctx.beginPath();
        setDrawSettings(true);
        ctx.lineWidth = 1/$canvasStore.zoom;
        ctx.strokeStyle = '#FFFFFF';
        ctx.rect(x+clearMargin, y+clearMargin, width-(clearMargin*2), height-(clearMargin*2));
        ctx.closePath();
        ctx.stroke();
    }

    export function addPoint() {
        const mouseX = $canvasStore.mouseX;
        const mouseY = $canvasStore.mouseY;

        let thereIsChangeOnX = mouseX >= latestPointX || mouseX <= latestPointX;
        let thereIsChangeOnY = mouseY >= latestPointY || mouseY <= latestPointY;

        let newX = latestPointX;
        let newY = latestPointY;

        if (thereIsChangeOnX) {
            newX = mouseX;
        }
        if (thereIsChangeOnY) {
            newY = mouseY;
        }

        if (thereIsChangeOnX || thereIsChangeOnY) {

            path.lineTo(newX, newY);
            updateBoundingBox(newX, newY);

            const addedPath = new Path2D();
            addedPath.moveTo(latestPointX, latestPointY);
            addedPath.lineTo(newX, newY);

            // Serialize path
            pathSVG += `M${latestPointX} ${latestPointY} L${newX} ${newY}`;

            draw(addedPath);
            
            latestPointX = newX;
            latestPointY = newY;
        }

        return [newX, newY];
    }

    export function select() {
        selected = true;
    }

    export function deselect() {
        selected = false;
    }

    export function move(isPan = false, dx = null, dy = null) {
        if (dx === null && dy === null) {
            let mouseX = $canvasStore.mouseX;
            let mouseY = $canvasStore.mouseY;

            let prevMouseX = $canvasStore.prevMouseX;
            let prevMouseY = $canvasStore.prevMouseY;
            
            dx = mouseX-prevMouseX;
            dy = mouseY-prevMouseY;
        }

        let m = new DOMMatrix();
        m.translateSelf(dx, dy);
        
        if (isPan) {
            panMatrix.translateSelf(dx, dy);
        }
        else {
            moveMatrix.translateSelf(dx, dy);
        }

        leftMost += dx;
        rightMost += dx;
        topMost += dy;
        bottomMost += dy;

        let updatedPath = new Path2D();
        updatedPath.addPath(path, m);
        path = updatedPath;
    }

    function updateSettings(setting, value) {
        dispatchUpdate(false);
        settings[setting] = parseInt(value);
        dispatchUpdate(true);
    }
</script>

{#if selected}
    <div class="piece-settings control-panel z-10" style="bottom: min({$canvasStore.height - topMost*$canvasStore.zoom}px, {$canvasStore.height}px); left: {Math.max(leftMost*$canvasStore.zoom, 0)}px;">
        <div class="flex gap-4">
            <span>x: {Math.round((leftMost - $canvasStore.xPan - $canvasStore.zoomDx)*$canvasStore.zoom)}</span>
            <span>y: {Math.round((topMost - $canvasStore.yPan - $canvasStore.zoomDy)*$canvasStore.zoom)}</span>
        </div>

        <div class="control-group">
            <div class="control">
                <label for="">size</label>
                <input value={settings.size} type="range" min="1" step="1" max="100" on:input={(e) => updateSettings('size', e.target.value)} >
            </div>
        </div>

        <div class="control-group">
            <div class="control">
                <label for="">color</label>
                <input value={settings.color} type="color" on:input={(e) => updateSettings('color', e.target.value)} >
            </div>
        </div>
    </div>
{/if}

<style>
    .piece-settings {
        position: absolute;
        background-color: var(--color-back-2);
        padding: 0 1em 0 1em;
        border-radius: 5px;
        border-top: 10px var(--color-back-3) solid;
        border-bottom: 10px var(--color-back-3) solid;
    }
</style>
