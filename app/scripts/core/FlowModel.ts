import {IFlowModel} from './IFlowModel';

/**
 * Base implementation of the {@link IFlowModel}.
 */
export class FlowModel implements IFlowModel {

    /**
     * Gets the node models.
     */
    public nodes: { [key: string]: any };

    constructor() {
        this.nodes = {};
    }
}
