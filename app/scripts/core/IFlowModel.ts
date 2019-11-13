import {IFlowNodeModel} from './IFlowNodeModel';

/**
 * The model of the whole flow.
 */
export interface IFlowModel {

    nodes: { [key: string]: IFlowNodeModel };
}
