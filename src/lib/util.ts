export function range(to:number, from:number=0, step:number=1, interpolate:boolean=false):Array<number> {
    const range:Array<number> = [];
    if (!interpolate) {
        for (let i:number = from; i <= to; i += step) {
            range.push(i);
        }
    }
    else {
        for (let i:number = 0; i <= step; i++) {
            let point:number = from+i*((to-from)/step);
            range.push(point);
        }
    }
    return range;
}

export function roundToInt(value:number, target:number):number {
    return Math.ceil(value/target)*target;
}

export function colorToInt(_c:string):number {
    _c = _c.substring(1);
    return parseInt(_c, 16);
}

export function colorToRgbInts(_c:string):Array<number> {
    _c = _c.substring(1);
    let rgb:Array<number> = (_c.match(/.{1,2}/g) ?? ['FF', 'FF', 'FF']).map((item:string) => parseInt(item, 16));
    return rgb;
}

export function invertColor(_c:string):string {
    // Convert color to integer
    let c:number = colorToInt(_c);
    c = 0xFFFFFF ^ c; // Invert using xor
    // onvert back to string
    _c = c.toString(16); // Ensure only 256 bits
    _c = ("000000" + _c).slice(-6); // Add padded zeros
    _c = "#" + _c;
    return _c;
}

export function colorIsDark(_c:string):boolean {
    let [r, g, b]:Array<number> = colorToRgbInts(_c);
    let isLight = r > 0xFF / 2 || g > 0xFF / 2 // blue is reasonably dark, so only checking if red and green are present for lightness;
    return !isLight;
}