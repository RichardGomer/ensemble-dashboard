/**
 * Colour utilities
 */

function colourScale(min: number, max: number, colours: string[], value: number): string {
    if (value <= min) {
        return colours[0];
    }
    if (value >= max) {
        return colours[colours.length - 1];
    }

    let range = max - min;
    let segment = range / (colours.length - 1);

    let index = Math.floor((value - min) / segment);
    let ratio = ((value - min) % segment) / segment;

    //console.log("Colour scale:", min, max, colours, value, "->", index, ratio);

    const hexToRgb = (hex: string) => {
        const bigint = parseInt(hex.replace('#', ''), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return { r, g, b };
    };

    const rgbToHex = (r: number, g: number, b: number) => {
        return (
            '#' +
            ((1 << 24) + (r << 16) + (g << 8) + b)
                .toString(16)
                .slice(1)
        );
    };

    const startColor = hexToRgb(colours[index]);
    const endColor = hexToRgb(colours[index + 1]);

    const r = Math.round(startColor.r + (endColor.r - startColor.r) * ratio);
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * ratio);
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * ratio);

    return rgbToHex(r, g, b);
}

let clrBadGood = ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00'];

let clrColdHot = ['#0000ff', '#0080ff', '#00ffff', '#ffb700ff', '#ff0000'];

export { colourScale, clrBadGood, clrColdHot };