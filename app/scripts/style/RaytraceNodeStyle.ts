import {HtmlCanvasVisual, IRenderContext, NodeStyleBase, Rect, SvgVisual} from 'yfiles'
import * as  _ from 'lodash';
import {Material, RayTracer, roundRect, Scene, Sphere, Vector3} from './raytracer'
import {RaytraceFlowNodeViewModel} from '../elements/raytrace/RaytraceFlowNodeViewModel';
import ImageFilters from './imageFilters';

export class RaytraceVisual extends HtmlCanvasVisual {
    get material(): Material {
        return this._material;
    }

    set material(value: Material) {
        this._dirty = value !== this._material
        this._material = value;
        this.sphere.material = value;
    }

    private rayTracer: RayTracer;
    private canvas: HTMLCanvasElement;

    private _material: Material;
    private sphere: Sphere;
    private _dirty: boolean;

    private getRendering(scaling): HTMLCanvasElement {
        if (this._dirty){
            this.canvas = this.canvas ?? document.createElement("canvas")
            this.canvas.width = Math.round(scaling * (105 - 2))
            this.canvas.height = Math.round(scaling * (150 - 12))
            const buffer = this.rayTracer.render(this.canvas.width, this.canvas.height);
            const ctx = this.canvas.getContext("2d")
            const arrayBuffer =  new Uint8ClampedArray(buffer);
            const imageData = ctx.getImageData(0,0, this.canvas.width, this.canvas.height);
            imageData.data.set(arrayBuffer);
            ctx.putImageData(imageData, 0,0);
            this._dirty = false
        }
        return this.canvas
    }

    public layout: Rect;

    constructor() {
        super();
        this._dirty = true;
        this._material = new Material(new Vector3(0.100, 0.32, 0.936), 0.1, 0.05, new Vector3(0.8, 0, 0));
        const scene = new Scene();
        this.sphere = new Sphere(new Vector3(0, -1, -20), 3, this._material);
        // add background sphere
        scene.add(
            new Sphere(new Vector3(10.0, -10004, -20), 10000,
                new Material(new Vector3(0.2, 0.2, 0.2), 0.5, 0, new Vector3()))
        );

        // add sphere
        scene.add(
            this.sphere
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

        // create the raytracer
        this.rayTracer = new RayTracer(backgroundColor, scene);
    }

    paint(renderContext: IRenderContext, ctx: CanvasRenderingContext2D): void {
        if (_.isNil(this.layout)) {
            return;
        }
        const l = this.layout;
        const canvas = renderContext.canvasComponent;
        const viewPoint = canvas.viewPoint;


        ctx.save();
        roundRect(ctx, l.x, l.y, l.width, l.height, 6, false);
        ctx.clip();

        // background
        ctx.fillStyle = '#6A5656';
        ctx.fillRect(l.x, l.y, l.width, l.height);

        const factor = 1;
        const im = this.getRendering(factor);
        if (!_.isNil(im)) {
            ctx.drawImage(im, l.x + 1, l.y + 12)
        }

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
        return this.updateVisual(renderContext, visual, node)
    }

    /**
     * Re-renders the node using the old visual for performance reasons.
     * @see Overrides {@link NodeStyleBase#updateVisual}
     * @return {SvgVisual}
     */
    updateVisual(renderContext, oldVisual, node) {
        const visual = oldVisual as RaytraceVisual;
        visual.layout = node.layout;
        visual.material = (node.tag as RaytraceFlowNodeViewModel).material;
        return visual;
    }
}
