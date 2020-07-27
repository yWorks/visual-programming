import {IPort, IPropertyObservable, Point} from 'yfiles';
import {PortType} from './PortType';
import {IFlowNodeViewModel} from './IFlowNodeViewModel';
import {IFlowNodeModel} from './IFlowNodeModel';

/**
 * Defines the view-model of a port.
 */
export interface IFlowPortViewModel {
    /**
     * The name of the property or port.
     */
    name: string;
    /**
     * Whether this is input or output.
     */
    portType: PortType;
    /**
     * The parent view-model of the node.
     */
    viewModel: IFlowNodeViewModel;

    position: Point;
    port:IPort;

    getNodeModel(): IFlowNodeModel
    setProperty(name, value);
}
