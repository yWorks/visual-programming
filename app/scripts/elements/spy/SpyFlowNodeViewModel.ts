import {FlowNodeViewModel} from '../../core/FlowNodeViewModel';
import {IFlowPortViewModel} from '../../core/IFlowPortViewModel';
import {FlowPortViewModel} from '../../core/FlowPortViewModel';
import {PortType} from '../../core/PortType';
import {Point} from 'yfiles';
import {FlowNodeModel} from '../../core/FlowNodeModel';

export class SpyFlowNodeViewModel extends FlowNodeViewModel {


    private readonly _input: IFlowPortViewModel;

    public get input(): IFlowPortViewModel {
        return this._input;
    }

    private _value: string;

    public set value(value: string) {
        this._value = value;
        this.firePropertyChanged('value');
    }

    public get value(): string {
        return this._value;

    }

    constructor(model) {
        super('Spy', model);

        this.portViewModels['Input'] = new FlowPortViewModel('value', PortType.INPUT, this, new Point(0.0, 30 - 2));
        this.model.nodes[this.id] = new FlowNodeModel(this.id, this.model);


    }

}
