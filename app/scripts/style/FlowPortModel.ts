import {BaseClass, ILookup, INode, IPort, IPortLocationModel, IPortLocationModelParameter, Point} from 'yfiles';
import {FlowPortParameter} from './FlowPortParameter';
import {PortType} from '../core/PortType';

/**
 * A custom port model.
 */
export class FlowPortModel extends BaseClass<IPortLocationModel>(IPortLocationModel) implements IPortLocationModel {

    private static _instance: FlowPortModel;

    constructor() {
        super();
    }

    static get Instance(): FlowPortModel {
        if (!FlowPortModel._instance) {
            FlowPortModel._instance = new FlowPortModel();
        }

        return FlowPortModel._instance;
    }

    createParameter(owner: INode, location: Point): IPortLocationModelParameter {
        // see if we are in the right or the left half of the node
        const portType = owner.layout && location.x > owner.layout.center.x ? PortType.OUTPUT : PortType.INPUT;
        const portIndex = owner.ports.filter(p => p.tag.portType === portType).size;
        return new FlowPortParameter(portType, portIndex, FlowPortModel.Instance);

    }

    getLocation(port: IPort, locationParameter: IPortLocationModelParameter): Point {
        const node = port.owner as INode;
        const layout = node.layout;
        if (locationParameter instanceof FlowPortParameter) {
            const param = locationParameter as FlowPortParameter;
            const yStart = 28;
            const outputCount = port.owner.ports.filter(p => p.tag.portType === PortType.OUTPUT).size;
            // const inputCount = port.owner.ports.filter(p => p.tag.portType === PortType.INPUT).size;
            switch (locationParameter.portType) {
                case PortType.OUTPUT: {
                    return new Point(layout.x + layout.width, layout.y + yStart + param.portIndex * 15)
                }
                case PortType.INPUT:
                    // putting input ports after the output ports
                    return new Point(layout.x, layout.y + yStart + outputCount * 15 + param.portIndex * 15);

                default:
                    throw new Error(`Port position '${locationParameter.portType}' is defined.`);
            }
        }
        throw new Error('The location parameter given is not recognized.');
    }

    getContext(port, locationParameter): ILookup {
        // no special types to lookup
        return ILookup.EMPTY
    }

    lookup(type): null {
        return null
    }

}


