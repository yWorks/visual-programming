import {Subscription} from 'kefir';

export default interface IFlowEdgeViewModel {
    /**
     * Gets or sets the stream subscription
     * listening to changes on the source.
     * @see https://kefirjs.github.io/kefir/#stream
     */
    subscription: Subscription;
}
