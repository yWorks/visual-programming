import {HtmlCanvasVisual, IRenderContext, NodeStyleBase, Point, Rect, SvgVisual} from 'yfiles'
import {} from '../elements/raytrace/RaytraceFlowNodeViewModel';
import * as  _ from 'lodash';
import {Material, RayTracer, roundRect, Scene, Sphere, Vector3} from './raytracer.js'

const margin = {
    top: 30,
    right: 3,
    bottom: -20,
    left: 3
};

export class RaytraceVisual extends HtmlCanvasVisual {
    private rayTracer: RayTracer;

    private getRendering(scaling) {
        const buffer = this.rayTracer.render(Math.round(scaling*(105 - 2)), Math.round(scaling * (150 - 12)));
        return new Uint8ClampedArray(buffer);
    }

    public layout: Rect;

    constructor() {
        super();
        const scene = new Scene();

        // add background sphere
        scene.add(
            new Sphere(new Vector3(10.0, -10004, -20), 10000,
                new Material(new Vector3(0.2, 0.2, 0.2), 0.5, 0, new Vector3()))
        );

        // add sphere
        scene.add(
            new Sphere(new Vector3(0, -1, -20), 3,
                new Material(new Vector3(0.100, 0.32, 0.936), 0.1, 0.05, new Vector3(0.8, 0, 0)))
        );

        // add lights
        scene.add(
            new Sphere(new Vector3(0, 20, -30), 3,
                new Material(new Vector3(0, -20, 0), 0, 0, new Vector3(1.2, 1.2, 1.2)))
        );
        scene.add(
            new Sphere(new Vector3(10, 20, 10), 3,
                new Material(new Vector3(), 0, 0, new Vector3(1, 1, 1)))
        );

        const backgroundColor = new Vector3(0.7, 0.8, 0.9);

        // create ray tracer
        this.rayTracer = new RayTracer(backgroundColor, scene);
    }

    paint(renderContext: IRenderContext, ctx: CanvasRenderingContext2D): void {
        if (_.isNil(this.layout)) {
            return;
        }
        const l = this.layout;
        const canvas = renderContext.canvasComponent;
        const viewPoint = canvas.viewPoint;
        const viewPort = canvas.viewport;
        const scaling = 1 / canvas.zoom;


        ctx.save();
        roundRect(ctx, l.x, l.y, l.width, l.height, 6, false);
        ctx.clip();

        // background
        ctx.fillStyle = '#6A5656';
        ctx.fillRect(l.x, l.y, l.width, l.height);

        ctx.restore();
        const factor = canvas.zoom;
        const imageData = ctx.getImageData(l.x, l.y, Math.round(factor*(105 - 2)), Math.round(factor * (150 - 12)));
        imageData.data.set(this.getRendering(factor));
        // const p = canvas.toViewCoordinates(l)
        ctx.putImageData(imageData, canvas.zoom * (-viewPoint.x + l.x), canvas.zoom * (-viewPoint.y + l.y));
        // ctx.putImageData(imageData, p.x, p.y);

        ctx.save();
        roundRect(ctx, l.x, l.y, l.width, l.height, 6, false);
        ctx.clip();

        // header
        ctx.fillStyle = 'green';
        ctx.fillRect(l.x, l.y, l.width, 20);
        ctx.font = '10px sans-serif';
        ctx.fillStyle = 'white';
        ctx.fillText('Raytrace', l.x + 7, l.y + 13);
        ctx.restore();


        // border
        roundRect(ctx, l.x, l.y, l.width, l.height, 6, false);
        ctx.strokeStyle = '#636363';
        ctx.lineWidth = 2;
        ctx.stroke();
        return;


        // ctx.translate(this.position.x, this.position.y);

        ctx.save()

        ctx.translate(viewPoint.x, viewPoint.y);
        ctx.scale(scaling, scaling);
        // create scene


        // get canvas
        const canvasWidth = 105;
        const canvasHeight = 150;

        // save start time
        const startTime = Date.now();
        // ctx.save();
        // ctx.rect(1, 1, 104, 147);
        // ctx.clip();
        // ctx.fillStyle = '#6A5656';
        // ctx.fillRect(0, 0, 105, 150);


        ctx.fillStyle = 'green';
        ctx.fillRect(0, 0, 110, 20);

        ctx.font = '10px sans-serif';
        ctx.fillStyle = 'white';
        ctx.fillText('Raytrace', 7, 13);

        // ctx.restore();
        roundRect(ctx, 0, 0, 105, 150, 6, false);
        ctx.strokeStyle = '#636363';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore()
        const totalDuration = (Date.now() - startTime) / 1000;
        // console.log(`Raytraced in ${totalDuration}s.`)
    }

}

export default class RaytraceNodeStyle extends NodeStyleBase {
    constructor() {
        super();
    }

    /**
     * Creates the visual for a node.
     * @see Overrides {@link NodeStyleBase#createVisual}
     * @return {SvgVisual}
     */
    createVisual(renderContext, node) {
        const visual = new RaytraceVisual();

        return visual
    }

    /**
     * Re-renders the node using the old visual for performance reasons.
     * @see Overrides {@link NodeStyleBase#updateVisual}
     * @return {SvgVisual}
     */
    updateVisual(renderContext, oldVisual, node) {
        const visual = oldVisual as RaytraceVisual;
        visual.layout = node.layout;

        return visual;
    }

}
