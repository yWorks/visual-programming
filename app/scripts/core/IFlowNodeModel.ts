import {FlowModel} from './FlowModel';
import {Stream} from 'kefir';

export interface IFlowNodeModel {
    id: string;

    model: FlowModel;
    onChange: Stream<any, never>;

    getPropertyValue(name: string);

    setPropertyValue(name: string, value: any): void;
}
