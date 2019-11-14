import {IFlowPortViewModel} from './IFlowPortViewModel';
import {IPort, Point, PropertyChangedEventArgs} from 'yfiles';
import {IFlowNodeViewModel} from './IFlowNodeViewModel';
import {PortType} from './PortType';
import {IFlowNodeModel} from './IFlowNodeModel';

/**
 * View-model attached to a port.
 */
export class FlowPortViewModel implements IFlowPortViewModel {
    get position(): Point {
        return this._position;
    }

    set position(value: Point) {
        this._position = value;
    }

    get viewModel(): IFlowNodeViewModel {
        return this._viewModel;
    }

    set viewModel(value: IFlowNodeViewModel) {
        this._viewModel = value;
    }

    get portType(): PortType {
        return this._portType;
    }

    set portType(value: PortType) {
        this._portType = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    private _name: string;
    private _portType: PortType;
    private _viewModel: IFlowNodeViewModel;
    private _position: Point;
    port:IPort;


    constructor(name, portType, viewModel, position) {
        this._name = name;
        this._portType = portType;
        this._viewModel = viewModel;
        this._position = position;

    }

    addPropertyChangedListener(listener: (sender: any, args: PropertyChangedEventArgs) => void): void {
    }

    removePropertyChangedListener(listener: (sender: any, args: PropertyChangedEventArgs) => void): void {
    }

    getNodeModel(): IFlowNodeModel {
        return this._viewModel.model.nodes[this._viewModel.id];
    }

    setProperty(name, value) {
        this.viewModel[name] = value;
    }
}
