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
    return Math.ceil(value/target)*target;
}

export function invertColor(c) {
    // Convert color to integer
    c = c.substring(1);
    c = parseInt(c, 16);
    c = 0xFFFFFF ^ c; // Invert using xor
    // onvert back to string
    c = c.toString(16); // Ensure only 256 bits
    c = ("000000" + c).slice(-6); // Add padded zeros
    c = "#" + c;
    return c;
}