import {FlowNodeViewModel} from '../../core/FlowNodeViewModel';
import {FlowPortViewModel} from '../../core/FlowPortViewModel';
import {PortType} from '../../core/PortType';
import {Point} from 'yfiles';
import {FlowNodeModel} from '../../core/FlowNodeModel';
import * as _ from 'lodash';

export class BarChartFlowNodeViewModel extends FlowNodeViewModel {


    private _values: number[];

    /**
     * Property used by the stream to set the raw data given as string.
     * @param arrayAsString {string} Presumably an array of numbers in a string.
     */
    public set rawValues(arrayAsString: string) {
        const parsed = this.parse(arrayAsString);
        if (!_.isNil(parsed)) {
            this._values = parsed;
            this.update();
            this.firePropertyChanged('values');
            this.setPropertyValue('values', parsed);
        }
    }

    public get values(): number[] {
        return this._values;

    }


    update() {

    }

    parse(x) {
        if (_.isString(x)) {
            const found = JSON.parse(x);
            if (_.isArray(found)) {
                return found;
            }
        }
        return null;
    }

    constructor(model) {
        super('Sum', model);

        this.portViewModels['Input'] = new FlowPortViewModel('rawValues', PortType.INPUT, this, new Point(0.0, 30 - 2));
        this.model.nodes[this.id] = new FlowNodeModel(this.id, this.model);

    }


}
