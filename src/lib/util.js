export function range(to, from=0, step=1, interpolate=false) {
    const range = [];
    if (!interpolate) {
        for (let i = from; i <= to; i += step) {
            range.push(i);
        }
    }
    else {
        for (let i = 0; i <= step; i++) {
            let point = from+i*((to-from)/step);
            range.push(point);
        }
    }
    return range;
}

export function roundToInt(value, target) {
    return Math.round(value/target)*target;
}
