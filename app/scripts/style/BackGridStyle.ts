import {HtmlCanvasVisual, IRenderContext, Point} from 'yfiles';

export class BackGridStyle extends HtmlCanvasVisual {
    minorTickSpacing: number
    minorTickSize: number
    private scaleFactor: number;
    private majorTickSpacing: number;
    private labeledTickSpacing: number;
    private tickSpacingFactor: number;

    constructor() {
        super();
        this.scaleFactor = 1;
        this.minorTickSpacing = 20;
        this.majorTickSpacing = 100;
        this.labeledTickSpacing = 200;
        this.tickSpacingFactor = 1;
    }

    paint(renderContext: IRenderContext, ctx: CanvasRenderingContext2D): void {
        const canvas = renderContext.canvasComponent;
        const viewPoint = canvas.viewPoint;
        const viewPort = canvas.viewport;
        ctx.translate(viewPoint.x, viewPoint.y);

        ctx.strokeStyle = '#000';
        ctx.fillStyle = '#000';

        ctx.beginPath();

        let tickNr = Math.floor(viewPort.x / this.minorTickSpacing);
        const worldX = tickNr * this.minorTickSpacing;
        let viewX = 0;//canvas.toViewCoordinates(new Point(worldX, 0)).x;


        while (viewX <= canvas.size.width + 10) {



            if ((tickNr % this.tickSpacingFactor) === 0) {
                ctx.moveTo(viewX, 0);
                ctx.lineTo(viewX, canvas.size.height);
            }

            viewX += (this.minorTickSpacing );
        }

        ctx.stroke();
    }

}
