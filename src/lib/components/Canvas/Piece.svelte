<script>
    import { createEventDispatcher, getContext } from "svelte";

    export let settings = {};
    export let selected = false;

    const canvasStore = getContext('canvasStore');
    const dispatch = createEventDispatcher();
    const ctx = $canvasStore.ctx;

    let serializedPath = "";
    let serializedMove = new DOMMatrix();
    let serializedPan = new DOMMatrix();
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

    export function serialize() {
        const s = {
            settings: settings,
            path: serializedPath,
            move: serializedMove.toJSON(),
            pan: serializedPan.toJSON(),
            leftMost: leftMost,
            rightMost: rightMost,
            topMost: topMost,
            bottomMost: bottomMost
        };

        return s;
    }

    export function deserialize(s) {
        settings = s.settings;

        serializedPath = s.path;
        path = new Path2D(s.path+"C");

        serializedMove = DOMMatrix.fromMatrix(s.move);
        let updatedPath = new Path2D();
        updatedPath.addPath(path, serializedMove);
        updatedPath.addPath(updatedPath, serializedPan);
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

            path.lineTo(newX, newY);
            updateBoundingBox(newX, newY);

            const addedPath = new Path2D();
            addedPath.moveTo(latestPointX, latestPointY);
            addedPath.lineTo(newX, newY);

            // Serialize path
            serializedPath += `M${latestPointX} ${latestPointY} L${newX} ${newY}`;

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

    export function move(isPan = false) {
        let mouseX = $canvasStore.mouseX;
        let mouseY = $canvasStore.mouseY;

        let prevMouseX = $canvasStore.prevMouseX;
        let prevMouseY = $canvasStore.prevMouseY;
        
        let dx = mouseX-prevMouseX;
        let dy = mouseY-prevMouseY;

        let m = new DOMMatrix();
        m.translateSelf(dx, dy);
        
        if (isPan) {
            serializedPan.translateSelf(dx, dy);
        }
        else {
            serializedMove.translateSelf(dx, dy);
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
        settings[setting] = value;
        dispatchUpdate(true);
    }
</script>

{#if selected}
    <div class="piece-settings control-panel" style="top: calc({bottomMost}px + var(--canvas-offset)); left: {leftMost}px;">
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
        margin-top: 1em;
        position: absolute;
        background-color: var(--color-back-2);
        padding: 0 1em 0 1em;
        border-radius: 5px;
        border-top: 10px var(--color-back-3) solid;
        border-bottom: 10px var(--color-back-3) solid;
    }
</style>