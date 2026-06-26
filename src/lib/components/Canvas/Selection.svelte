<script lang="ts">
    import { calcBoundingBoxFromTwoPoints } from "$lib/util";

    interface Props {
        p1: {
            x: number;
            y: number;
        };
        p2: {
            x: number;
            y: number;
        };
    }

    let props: Props = $props();
    let boundingBox = $derived(
        calcBoundingBoxFromTwoPoints(
            props.p1.x,
            props.p1.y,
            props.p2.x,
            props.p2.y,
        ),
    );
</script>

<span
    class="pointer-events-none border border-dashed border-gray-600 fixed"
    style="left:{boundingBox[0]}px; top: calc({boundingBox[1]}px + var(--header-height)); width:{boundingBox[2]}px; height:{boundingBox[3]}px;"
>
</span>
