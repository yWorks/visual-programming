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
 * @class RenderPlanner
 */
export class RenderPlanner {
    constructor(jobCount, scene, backgroundColor, width, height) {

        this.jobCount = jobCount;
        this.scene = scene;
        this.backgroundColor = backgroundColor;
        this.width = width;
        this.height = height;

        this.running = false;
        this.completedJobs = 0;

        this.onUpdateReceived = function (sectionStart, sectionHeight, buf8) {
        };

        this.serializeScene();

        this.workers = [];
        for (var i = 0; i < this.jobCount; i++) {
            this.workers.push(new Worker('../src/RenderWorker.js', {type: 'module'}));
        }
    }

    initialize() {
        // prepare all workers
        for (var i = 0; i < this.workers.length; i++) {
            this.prepareWorker(i, this.workers[i]);
        }
    }

    start() {
        this.running = true;
        this.completedJobs = 0;

        // start all workers
        for (var i = 0; i < this.workers.length; i++) {
            this.startWorker(this.workers[i]);
        }

    }

    serializeScene() {
        // serialize scene
        this.serializedElements = [];
        var elements = this.scene.getElements();
        for (var i = 0; i < elements.length; i++) {
            var el = elements[i];
            this.serializedElements.push(el.serialize());
        }
    }

    prepareWorker(index, rendererWorker) {
        // send scene to workers
        rendererWorker.postMessage({
            'action': 'elements',
            'data': this.serializedElements
        });

        // set background color
        rendererWorker.postMessage({
            'action': 'backgroundColor',
            'data': [this.backgroundColor.x, this.backgroundColor.y, this.backgroundColor.z]
        });

        var sectionHeight = Math.floor(this.height / this.jobCount);
        var sectionStart = Math.floor(index * sectionHeight);

        // set ray tracer dimensions
        rendererWorker.postMessage({
            'action': 'dimensions',
            'data': [this.width, this.height, sectionStart, sectionHeight]
        });

        // add listeners
        rendererWorker.onmessage = function (e) {
            var action = e.data.action;
            var data = e.data.data;

            if (action == 'result') {
                this.completedJobs++;
                if (this.completedJobs == this.jobCount) {
                    this.running = false;
                }

                var buf8 = data;
                this.onUpdateReceived(sectionStart, sectionHeight, buf8);
            }
        }.bind(this);
    }

    startWorker(rendererWorker) {
        // start rendering!
        rendererWorker.postMessage({
            'action': 'render'
        });
    }

    isRunning() {
        return this.running;
    }

    updateScene() {
        this.serializeScene();

        for (var i = 0; i < this.workers.length; i++) {
            // send scene to workers
            this.workers[i].postMessage({
                'action': 'elements',
                'data': this.serializedElements
            });
        }
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
        var len2 = this.length2();
        if (len2 > 0) {
            var invLen = 1 / Math.sqrt(len2);
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
        var tnear = INFINITY;
        var element = null;

        var elements = this.scene.getElements();
        var elementsLen = elements.length;

        var hitInfo = {t0: INFINITY, t1: INFINITY};
        for (var i = 0; i < elementsLen; i++) {
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

        var surfaceColor = new Vector3(0, 0, 0);
        var intersectionPoint = rayOrigin.clone().add(rayDir.clone().multiply(tnear));
        var intersectionNormal = element.getNormal(intersectionPoint);

        var bias = 1e-4;
        var inside = false;
        if (rayDir.dotProduct(intersectionNormal) > 0) {
            intersectionNormal.revert();
            inside = true;
        }

        var mat = element.getMaterial();
        for (var i = 0; i < elementsLen; i++) {
            var el = elements[i];
            var lightMat = el.getMaterial();
            if (lightMat.emissionColor.x > 0 || lightMat.emissionColor.y > 0 ||
                lightMat.emissionColor.z > 0) {
                // light source
                var transmission = new Vector3(1, 1, 1);
                var lightDirection = el.getCenter().clone().subtract(intersectionPoint);
                lightDirection.normalize();
                var lightHitInfo = {t0: INFINITY, t1: INFINITY};

                for (var j = 0; j < elementsLen; j++) {
                    if (i != j) {
                        if (elements[j].intersect(intersectionPoint.clone().add(intersectionNormal.clone().multiply(bias)), lightDirection, lightHitInfo)) {
                            transmission.x = 0;
                            transmission.y = 0;
                            transmission.z = 0;
                            break;
                        }
                    }

                }

                var lightRatio = Math.max(0, intersectionNormal.dotProduct(lightDirection));
                if (mat.surfaceColor) {
                    surfaceColor.add(mat.surfaceColor.clone().product(transmission).product(lightMat.emissionColor.clone().multiply(lightRatio)));
                }
            }
        }

        surfaceColor.add(mat.emissionColor);
        return surfaceColor;
    }

    render(width, height, startY, scanHeight) {
        if (startY == undefined) {
            startY = 0;
        }

        if (scanHeight == undefined) {
            scanHeight = height;
        }

        // create buffer, 4 bytes for 1 pixel, r, g, b, a order
        var colorDepth = 4;
        var buffer = new ArrayBuffer(width * scanHeight * colorDepth);
        var bufferView = new Uint32Array(buffer);
        var invWidth = 1 / width;
        var invHeight = 1 / height;
        var fov = 30;
        var aspectRatio = width / height;
        var angle = Math.tan(Math.PI * 0.5 * fov / 180);
        var rayOrigin = new Vector3(0, 0, 0);
        var pixelIndex = 0;

        // trace rays
        for (var y = startY; y < startY + scanHeight; ++y) {
            for (var x = 0; x < width; ++x, ++pixelIndex) {
                var xx = (2 * ((x + 0.5) * invWidth) - 1) * angle * aspectRatio;
                var yy = (1 - 2 * ((y + 0.5) * invHeight)) * angle;
                var rayDir = new Vector3(xx, yy, -1);
                rayDir.normalize();

                // trace
                var pixelColor = this.trace(rayOrigin, rayDir, 0);

                pixelColor.x = Math.min(1, pixelColor.x);
                pixelColor.y = Math.min(1, pixelColor.y);
                pixelColor.z = Math.min(1, pixelColor.z);

                // convert pixel to bytes
                var r = Math.round(pixelColor.x * 255);
                var g = Math.round(pixelColor.y * 255);
                var b = Math.round(pixelColor.z * 255);

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
        var l = this.center.clone().subtract(rayOrigin);
        var tca = l.dotProduct(rayDir);
        if (tca < 0) {
            return false;
        }

        var d2 = l.dotProduct(l) - tca * tca;
        if (d2 > this.radius2) {
            return false;
        }

        var thc = Math.sqrt(this.radius2 - d2);

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
        var normal = point.clone().subtract(this.getCenter());
        normal.normalize();
        return normal;
    }

    serialize() {
        var sc = this.material.surfaceColor;
        var ec = this.material.emissionColor;
        var transparency = this.material.transparency;
        var reflection = this.material.reflection;

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
        var center = data.center;
        var radius = data.radius;
        var surfaceColor = data.material.surfaceColor;
        var emissionColor = data.material.emissionColor;
        var transparency = data.material.transparency;
        var reflection = data.material.reflection;

        return new Sphere(new Vector3(center[0], center[1], center[2]), radius,
            new Material(new Vector3(surfaceColor[0], surfaceColor[1], surfaceColor[2]), reflection, transparency,
                new Vector3(emissionColor[0], emissionColor[1], emissionColor[2])));

    }
}


var messageHandler = undefined;

onmessage = function (e) {
    if (messageHandler) {
        messageHandler(e);
    }
};

var scene = new Scene();
var backgroundColor = new Vector3(0, 0, 0);
var rendererWidth = 0;
var rendererHeight = 0;
var startY = 0;
var scanHeight = 0;

function rendererMessageHandler(e) {
    var action = e.data.action;
    var data = e.data.data;

    if (action == 'elements') {
        scene.clear();
        var elements = data;
        for (var i = 0; i < elements.length; i++) {
            scene.add(Sphere.deserialize(elements[i]));
        }
    } else if (action == 'backgroundColor') {
        backgroundColor.x = data[0];
        backgroundColor.y = data[1];
        backgroundColor.z = data[2];
    } else if (action == 'dimensions') {
        rendererWidth = data[0];
        rendererHeight = data[1];
        startY = data[2];
        scanHeight = data[3];
    } else if (action == 'render') {
        startRendering();
    }
}

messageHandler = rendererMessageHandler;

function startRendering() {
    var startTime = new Date();
    var rayTracer = new RayTracer(backgroundColor, scene);
    var buffer = rayTracer.render(rendererWidth, rendererHeight, startY, scanHeight);
    var endTime = new Date();

    // send result buffer
    var buf8 = new Uint8ClampedArray(buffer);
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
        var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
        for (var side in defaultRadius) {
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
