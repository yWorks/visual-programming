export default class ImageFilters {
    static getPixels(ctx, width, height): ImageData {
        return ctx.getImageData(0, 0, width, height);
    }

    static applyFilter(ctx, filter, width, height) {
        var idata = filter(ImageFilters.getPixels(ctx, width, height));
        ctx.putImageData(idata, 0, 0);
    }

    static grayscale(pixels) {
        var d = pixels.data;
        for (var i = 0; i < d.length; i += 4) {
            var r = d[i];
            var g = d[i + 1];
            var b = d[i + 2];
            // CIE luminance for the RGB
            // The human eye is bad at seeing red and blue, so we de-emphasize them.
            var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            d[i] = d[i + 1] = d[i + 2] = v
        }
        return pixels;
    };

    static threshold(pixels, threshold = 100) {
        var d = pixels.data;
        for (var i = 0; i < d.length; i += 4) {
            var r = d[i];
            var g = d[i + 1];
            var b = d[i + 2];
            var v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= threshold) ? 255 : 0;
            d[i] = d[i + 1] = d[i + 2] = v
        }
        return pixels;
    };

}


