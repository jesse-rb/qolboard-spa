<script>
    import { getContext } from "svelte";


    let points = [];
    let size = 1;
    let color = '#af8a8a';
    let ctx = getContext('ctx');

    function draw() {
        ctx.fillStyle = color;
        for (let i = 0; i < points.length; i+=2) {
            const x = i;
            const y = i+1;
            ctx.fillRect(x, y, size, size);
        }
    }

    function addPoint(x, y) {
        points = [...points, x, y];
    }
</script>