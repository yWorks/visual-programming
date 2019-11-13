import {IEdge, IGraph, IPort} from 'yfiles';
import {IFlowModel} from './IFlowModel';

/**
 * Defines the main view.
 */
export interface ISurface {
    model:IFlowModel;
    graph: IGraph;
    connect(source: IPort, target:IPort): IEdge;
    layout():void;
}
