import {FlowNodeViewModel} from '../../core/FlowNodeViewModel';
import {FlowPortViewModel} from '../../core/FlowPortViewModel';
import {PortType} from '../../core/PortType';
import {Point} from 'yfiles';
import {FlowNodeModel} from '../../core/FlowNodeModel';
import * as _ from 'lodash';

export class TestFlowNodeViewModel extends FlowNodeViewModel {

    public set a(value: string) {
        this._a = value;
        this.update();
        this.firePropertyChanged('a');
        this.setPropertyValue('a', value);
    }

    public get a(): string {
        return this._a;

    }

    public set b(value: string) {
        this._b = value;
        this.update();
        this.firePropertyChanged('b');
        this.setPropertyValue('b', value);
    }

    public get b(): string {
        return this._b;

    }

    public set sum(value: string) {
        this._sum = value;
        this.firePropertyChanged('sum');
        this.setPropertyValue('sum', value);
    }

    public get sum(): string {
        return this._sum;

    }


    private _a: string;

    private _b: string;

    private _sum: string;

    constructor(model) {
        super('Sum', model);

        this.portViewModels['Output'] = new FlowPortViewModel('sum', PortType.OUTPUT, this, new Point(70.0, 30 - 2));
        this.portViewModels['Input1'] = new FlowPortViewModel('a', PortType.INPUT, this, new Point(0.0, 46 - 2));
        this.portViewModels['Input2'] = new FlowPortViewModel('b', PortType.INPUT, this, new Point(0.0, 62 - 2));
        this.model.nodes[this.id] = new FlowNodeModel(this.id, this.model);

    }

    update() {
        const a = this.parse(this.a);
        const b = this.parse(this.b);
        if (!_.isNil(a) && !_.isNil(b)) {
            this.sum = (a + b).toString();
        } else {
            this.sum = '';
        }
    }

    parse(x) {
        if (_.isString(x)) {
            return parseFloat(x);
        }
        return null;
    }


}
