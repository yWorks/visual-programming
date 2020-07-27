/**
 * An edge style that draws a bendless edge in an orthogonal fashion.
 * All existing bends of the edge are ignored.
 */
import {
    BaseClass, Fill, FillConvertible,
    GeneralPath,
    IArrow,
    IEdgeStyle,
    List,
    PathBasedEdgeStyleRenderer,
    Point,
    SolidColorFill,
    Stroke,
    Tangent
} from 'yfiles';

export default class RoutingEdgeStyle extends BaseClass<IEdgeStyle>(IEdgeStyle) {
    private inSegmentLengthField: any;
    private outSegmentLengthField: any;
    private middleSegmentOffsetField: number;
    private smoothingField: number;
    private strokeField: Stroke;
    private sourceArrowField: IArrow;
    private targetArrowField: IArrow;

    /**
     * Creates a new instance of RoutingEdgeStyle.
     * @param outSegmentLength The length of the horizontal segment that connects to the source node.
     * @param inSegmentLength The length of the horizontal segment that connects to the target node.
     * @param fill
     * @param thickness
     */
    constructor(outSegmentLength: number, inSegmentLength: number, fill: Fill|FillConvertible = null, thickness: number = 0) {
        super();
        this.inSegmentLengthField = inSegmentLength;
        this.outSegmentLengthField = outSegmentLength;
        this.middleSegmentOffsetField = 50;
        this.smoothingField = 10;
        const f = fill || new SolidColorFill(100, 100, 100);
        this.strokeField = new Stroke(f, thickness || 2);
        this.sourceArrowField = IArrow.NONE;
        this.targetArrowField = IArrow.NONE;
    }

    /**
     * Gets the length of the horizontal segment that connects to the source node.
     * @type {number}
     */
    get outSegmentLength() {
        return this.outSegmentLengthField
    }

    /**
     * Sets the length of the horizontal segment that connects to the source node.
     * @type {number}
     */
    set outSegmentLength(value) {
        this.outSegmentLengthField = value
    }

    /**
     * Gets the length of the horizontal segment that connects to the target node.
     * @type {number}
     */
    get inSegmentLength() {
        return this.inSegmentLengthField
    }

    /**
     * Sets the length of the horizontal segment that connects to the target node.
     * @type {number}
     */
    set inSegmentLength(value) {
        this.inSegmentLengthField = value
    }

    /**
     * Gets the distance on the y-axis between the source port and the horizontal middle segment.
     * This only has an effect when the source location is right of the target location.
     * @type {number}
     */
    get middleSegmentOffset() {
        return this.middleSegmentOffsetField
    }

    /**
     * Sets the distance on the y-axis between the source port and the horizontal middle segment.
     * This only has an effect when the source location is right of the target location.
     * @type {number}
     */
    set middleSegmentOffset(value) {
        this.middleSegmentOffsetField = value
    }

    /**
     * Gets the amount of corner rounding.
     * @type {number}
     */
    get smoothing() {
        return this.smoothingField
    }

    /**
     * Sets the amount of corner rounding.
     * @type {number}
     */
    set smoothing(value) {
        this.smoothingField = value
    }

    /**
     * Gets the source arrow.
     * @type {IArrow}
     */
    get sourceArrow() {
        return this.sourceArrowField
    }

    /**
     * Sets the source arrow.
     * @type {IArrow}
     */
    set sourceArrow(value) {
        this.sourceArrowField = value
    }

    /**
     * Gets the target arrow.
     * @type {IArrow}
     */
    get targetArrow() {
        return this.targetArrowField
    }

    /**
     * Sets the target arrow.
     * @type {IArrow}
     */
    set targetArrow(value) {
        this.targetArrowField = value
    }

    /**
     * Gets the stroke used to draw the edge.
     * @type {Stroke}
     */
    get stroke() {
        return this.strokeField
    }

    /**
     * Sets the stroke used to draw the edge.
     * @type {Stroke}
     */
    set stroke(value) {
        this.strokeField = value
    }

    get renderer() {
        return new RoutingEdgeStyleRenderer()
    }

    /**
     * @returns {Object}
     */
    // @ts-ignore
    clone(): RoutingEdgeStyle {
        return new RoutingEdgeStyle(this.outSegmentLength, this.inSegmentLength)
    }
}

/**
 * Renderer for {@link RoutingEdgeStyle}.
 */
class RoutingEdgeStyleRenderer extends PathBasedEdgeStyleRenderer<RoutingEdgeStyle> {
    constructor() {
        // @ts-ignore
        super(RoutingEdgeStyle.$class)
    }

    /**
     * Constructs the orthogonal edge path.
     * @see Overrides {@link PathBasedEdgeStyleRenderer#createPath}
     * @returns {GeneralPath}
     */
    createPath() {
        // create a new GeneralPath with the edge points
        const generalPath = new GeneralPath();
        const points: List<Point> = this.getEdgePoints(this.edge);
        generalPath.moveTo(points.get(0));
        for (let i = 1; i < points.size; i++) {
            generalPath.lineTo(points.get(i))
        }
        return generalPath
    }

    /**
     * Calculates the points that define the edge path.
     * @returns {List.<Point>} A list of points that define the edge path.
     * @private
     */
    getEdgePoints(edge) {
        const sourcePoint = edge.sourcePort.location;
        const targetPoint = edge.targetPort.location;
        const points = new List<Point>();
        points.add(sourcePoint);

        // the source location with the x-offset
        const sourceX = sourcePoint.x + this.style.outSegmentLength;
        // the target location with the x-offset
        const targetX = targetPoint.x - this.style.inSegmentLength;

        // check if source and target are not exactly in the same row - in this case we just draw a straight line
        if (sourceX > targetX) {
            // source is right of target
            // get the y-coordinate of the vertical middle segment
            const middleSegmentY =
                sourcePoint.y <= targetPoint.y
                    ? edge.sourcePort.owner.layout.bottomRight.y + 10
                    : edge.sourcePort.owner.layout.topRight.y - 10;
            points.add(new Point(sourceX, sourcePoint.y));
            points.add(new Point(sourceX, middleSegmentY));
            points.add(new Point(targetX, middleSegmentY));
            points.add(new Point(targetX, targetPoint.y))
        } else {
            if (sourcePoint.y !== targetPoint.y) {
                // source is left of target
                points.add(new Point(sourceX, sourcePoint.y));
                points.add(new Point(sourceX + 10, targetPoint.y))
            }
        }

        points.add(targetPoint);
        return points
    }

    getTangent(ratio: number): Tangent | null {
        return this.getPath().getTangent(ratio)
    }

    getTangentForSegment(segmentIndex, ratio) {
        return this.getPath().getTangentForSegment(segmentIndex, ratio)
    }

    getSegmentCount() {
        // the segment count is the number of edge points - 1
        // @ts-ignore
        const p = this.getEdgePoints(this.item);
        return p.size - 1
    }

    getTargetArrow() {
        return this.style.targetArrow
    }

    getSourceArrow() {
        return this.style.sourceArrow
    }

    getStroke() {
        return this.style.stroke
    }

    getSmoothingLength() {
        return this.style.smoothing
    }

    lookup(type) {
        return super.lookup.call(this, type)
    }
}
