import {BaseClass, INode, IPortLocationModelParameter} from 'yfiles';
import {PortType} from '../core/PortType';
import {FlowPortModel} from './FlowPortModel';

/**
 * Custom parameter for the {@link FlowPortModel}.
 */
export class FlowPortParameter extends BaseClass<IPortLocationModelParameter>(IPortLocationModelParameter) implements IPortLocationModelParameter {
    get portIndex(): number {
        return this._portIndex;
    }

    get portType(): PortType {
        return this._portType;
    }

    get model(): FlowPortModel {
        return this._model;
    }
    private readonly _portIndex: number;

    _portType: any;
    _model: any;

    constructor(position: PortType, portIndex: number, model: FlowPortModel) {
        super();
        this._portType = position;
        this._model = model;
        this._portIndex = portIndex;
    }

    supports(owner): boolean {
        // this implementation supports only nodes
        return INode.isInstance(owner)
    }

    clone(): this {
        return new FlowPortParameter(this._portType, this._portIndex, this._model) as this;
    }


}

