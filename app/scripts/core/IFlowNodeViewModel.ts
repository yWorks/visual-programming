import {IPropertyObservable} from 'yfiles';
import {IFlowModel} from './IFlowModel';
import {IFlowPortViewModel} from './IFlowPortViewModel';

/**
 * Defines the view-model of a flow element.
 */
export interface IFlowNodeViewModel extends IPropertyObservable {
    id: string;
    model: IFlowModel;
    title: String;

    setPropertyValue(name, value);

    /**
     * Gets or sets whether the element is enabled
     * and propagates data across the flow.
     */
    enabled: boolean;

    /**
     * Gets or sets the view-models assigned to the ports.
     */
    portViewModels: { [key: string]: IFlowPortViewModel };
}
