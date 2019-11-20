/**
 * Simple raytracer based on this repo https://github.com/ercang/raytracer-js
 */

const MAX_RAY_DEPTH = 1;
const INFINITY = 1e8;
import {MD5} from 'object-hash';

/**
 * @class Scene
 */
export class Scene {
    constructor() {
        this.elements = [];
    }

    add(element) {
        this.elements.push(element);
    }

    getElements() {
        return this.elements;
    }

    clear() {
        this.elements = [];
    }
}


/**
 * @class Material
 */
export class Material {
    constructor(/*Vector3*/surfaceColor,/*number*/ reflection,/*number*/ transparency,/*Vector3*/ emissionColor) {
        this.surfaceColor = surfaceColor;
        this.transparency = transparency;
        this.reflection = reflection;
        this.emissionColor = emissionColor;
    }

    get hash() {
        return MD5([this.surfaceColor.x, this.surfaceColor.y, this.surfaceColor.z, this.reflection, this.transparency, this.emissionColor.x, this.emissionColor.y, this.emissionColor.z]);
    }
}

export class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    get hash() {
        return MD5([this.x, this.y, this.z]);
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    length2() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    length() {
        return Math.sqrt(this.length2());
    }

    normalize() {
        const len2 = this.length2();
        if (len2 > 0) {
            const invLen = 1 / Math.sqrt(len2);
            this.x *= invLen;
            this.y *= invLen;
            this.z *= invLen;
        }

        return this;
    }

    dotProduct(otherVector) {
        return this.x * otherVector.x + this.y * otherVector.y + this.z * otherVector.z;
    }

    product(otherVector) {
        this.x *= otherVector.x;
        this.y *= otherVector.y;
        this.z *= otherVector.z;
        return this;
    }

    multiply(scalarValue) {
        this.x *= scalarValue;
        this.y *= scalarValue;
        this.z *= scalarValue;
        return this;
    }

    add(otherVector) {
        this.x += otherVector.x;
        this.y += otherVector.y;
        this.z += otherVector.z;
        return this;
    }

    subtract(otherVector) {
        this.x -= otherVector.x;
        this.y -= otherVector.y;
        this.z -= otherVector.z;
        return this;
    }

    revert() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
    }
}

/**
 * @class RayTracer
 */
export class RayTracer {
    constructor(backgroundColor, scene) {
        this.backgroundColor = backgroundColor;
        this.scene = scene;
    }

    trace(rayOrigin, rayDir, depth) {
        let i;
        let tnear = INFINITY;
        let element = null;

        const elements = this.scene.getElements();
        const elementsLen = elements.length;

        const hitInfo = {t0: INFINITY, t1: INFINITY};
        for (i = 0; i < elementsLen; i++) {
            hitInfo.t0 = INFINITY;
            hitInfo.t1 = INFINITY;
            var el = elements[i];
            if (el.intersect(rayOrigin, rayDir, hitInfo)) {
                // ray hit intersect
                if (hitInfo.t0 < 0) {
                    hitInfo.t0 = hitInfo.t1;
                }

                if (hitInfo.t0 < tnear) {
                    tnear = hitInfo.t0;
                    element = el;
                }
            }
        }

        if (element == null) {
            // no hit, return background color
            return this.backgroundColor;
        }

        const surfaceColor = new Vector3(0, 0, 0);
        const intersectionPoint = rayOrigin.clone().add(rayDir.clone().multiply(tnear));
        const intersectionNormal = element.getNormal(intersectionPoint);

        const bias = 1e-4;
        let inside = false;
        if (rayDir.dotProduct(intersectionNormal) > 0) {
            intersectionNormal.revert();
            inside = true;
        }

        const mat = element.getMaterial();
        for (let i = 0; i < elementsLen; i++) {
            let el = elements[i];
            const lightMat = el.getMaterial();
            if (lightMat.emissionColor.x > 0 || lightMat.emissionColor.y > 0 ||
                lightMat.emissionColor.z > 0) {
                // light source
                const transmission = new Vector3(1, 1, 1);
                const lightDirection = el.getCenter().clone().subtract(intersectionPoint);
                lightDirection.normalize();
                const lightHitInfo = {t0: INFINITY, t1: INFINITY};

                for (let j = 0; j < elementsLen; j++) {
                    if (i !== j) {
                        if (elements[j].intersect(intersectionPoint.clone().add(intersectionNormal.clone().multiply(bias)), lightDirection, lightHitInfo)) {
                            transmission.x = 0;
                            transmission.y = 0;
                            transmission.z = 0;
                            break;
                        }
                    }

                }

                const lightRatio = Math.max(0, intersectionNormal.dotProduct(lightDirection));
                if (mat.surfaceColor) {
                    surfaceColor.add(mat.surfaceColor.clone().product(transmission).product(lightMat.emissionColor.clone().multiply(lightRatio)));
                }
            }
        }

        surfaceColor.add(mat.emissionColor);
        return surfaceColor;
    }

    render(width, height, startY, scanHeight) {
        if (startY === undefined) {
            startY = 0;
        }

        if (scanHeight === undefined) {
            scanHeight = height;
        }

        // create buffer, 4 bytes for 1 pixel, r, g, b, a order
        const colorDepth = 4;
        const buffer = new ArrayBuffer(width * scanHeight * colorDepth);
        const bufferView = new Uint32Array(buffer);
        const invWidth = 1 / width;
        const invHeight = 1 / height;
        const fov = 30;
        const aspectRatio = width / height;
        const angle = Math.tan(Math.PI * 0.5 * fov / 180);
        const rayOrigin = new Vector3(0, 0, 0);
        let pixelIndex = 0;

        // trace rays
        for (let y = startY; y < startY + scanHeight; ++y) {
            for (let x = 0; x < width; ++x, ++pixelIndex) {
                const xx = (2 * ((x + 0.5) * invWidth) - 1) * angle * aspectRatio;
                const yy = (1 - 2 * ((y + 0.5) * invHeight)) * angle;
                const rayDir = new Vector3(xx, yy, -1);
                rayDir.normalize();

                // trace
                const pixelColor = this.trace(rayOrigin, rayDir, 0);

                pixelColor.x = Math.min(1, pixelColor.x);
                pixelColor.y = Math.min(1, pixelColor.y);
                pixelColor.z = Math.min(1, pixelColor.z);

                // convert pixel to bytes
                const r = Math.round(pixelColor.x * 255);
                const g = Math.round(pixelColor.y * 255);
                const b = Math.round(pixelColor.z * 255);

                bufferView[pixelIndex] =
                    (255 << 24) |	// alpha
                    (b << 16) |	// blue
                    (g << 8) |	// green
                    r;		// red
            }
        }

        return buffer;
    }
}

/**
 * @class Sphere
 */
export class Sphere {
    constructor(center, radius, material) {
        this.center = center;
        this.radius = radius;
        this.radius2 = radius * radius;
        this.material = material;
    }

    intersect(rayOrigin, rayDir, out) {
        const l = this.center.clone().subtract(rayOrigin);
        const tca = l.dotProduct(rayDir);
        if (tca < 0) {
            return false;
        }

        const d2 = l.dotProduct(l) - tca * tca;
        if (d2 > this.radius2) {
            return false;
        }

        const thc = Math.sqrt(this.radius2 - d2);

        out.t0 = tca - thc;
        out.t1 = tca + thc;

        return true;
    }

    getCenter() {
        return this.center;
    }

    getRadius() {
        return this.radius;
    }

    getMaterial() {
        return this.material;
    }

    getNormal(point) {
        const normal = point.clone().subtract(this.getCenter());
        normal.normalize();
        return normal;
    }

    serialize() {
        const sc = this.material.surfaceColor;
        const ec = this.material.emissionColor;
        const transparency = this.material.transparency;
        const reflection = this.material.reflection;

        return {
            'center': [this.center.x, this.center.y, this.center.z],
            'radius': this.radius,
            'material': {
                'surfaceColor': [sc.x, sc.y, sc.z],
                'emissionColor': [ec.x, ec.y, ec.z],
                'transparency': transparency,
                'reflection': reflection
            }
        };
    }

    static deserialize(data) {
        const center = data.center;
        const radius = data.radius;
        const surfaceColor = data.material.surfaceColor;
        const emissionColor = data.material.emissionColor;
        const transparency = data.material.transparency;
        const reflection = data.material.reflection;

        return new Sphere(new Vector3(center[0], center[1], center[2]), radius,
            new Material(new Vector3(surfaceColor[0], surfaceColor[1], surfaceColor[2]), reflection, transparency,
                new Vector3(emissionColor[0], emissionColor[1], emissionColor[2])));

    }
}


let messageHandler = undefined;

onmessage = function (e) {
    if (messageHandler) {
        messageHandler(e);
    }
};

var scene = new Scene();
var backgroundColor = new Vector3(0, 0, 0);
let rendererWidth = 0;
let rendererHeight = 0;
var startY = 0;
var scanHeight = 0;

function rendererMessageHandler(e) {
    const action = e.data.action;
    const data = e.data.data;

    if (action === 'elements') {
        scene.clear();
        const elements = data;
        for (let i = 0; i < elements.length; i++) {
            scene.add(Sphere.deserialize(elements[i]));
        }
    } else if (action === 'backgroundColor') {
        backgroundColor.x = data[0];
        backgroundColor.y = data[1];
        backgroundColor.z = data[2];
    } else if (action === 'dimensions') {
        rendererWidth = data[0];
        rendererHeight = data[1];
        startY = data[2];
        scanHeight = data[3];
    } else if (action === 'render') {
        startRendering();
    }
}

messageHandler = rendererMessageHandler;

function startRendering() {
    const rayTracer = new RayTracer(backgroundColor, scene);
    const buffer = rayTracer.render(rendererWidth, rendererHeight, startY, scanHeight);

    const buf8 = new Uint8ClampedArray(buffer);
    postMessage({
        'action': 'result',
        'data': buf8
    });
}

/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
export function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke === 'undefined') {
        stroke = true;
    }
    if (typeof radius === 'undefined') {
        radius = 5;
    }
    if (typeof radius === 'number') {
        radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
        const defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
        for (let side in defaultRadius) {
            radius[side] = radius[side] || defaultRadius[side];
        }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
        ctx.fill();
    }
    if (stroke) {
        ctx.stroke();
    }

}
