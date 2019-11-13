import {BaseClass, DefaultPortCandidate, INode, IPortCandidate, IPortCandidateProvider, List, PortCandidateProviderBase} from 'yfiles';
import {FlowPortModel} from './FlowPortModel';
import {PortType} from '../core/PortType';
import {IFlowPortViewModel} from '../core/IFlowPortViewModel';

export default class PortCandidateProvider extends   PortCandidateProviderBase {
    node: INode;

    constructor(node) {
        super();
        this.node = node
    }


    /**
     * Returns a port candidate on the right side of the node where an edge can start.
     * @param {IInputModeContext} context - The context for which the candidates should be provided.
     * @returns {IEnumerable.<IPortCandidate>}
     */
    getAllSourcePortCandidates(context) {
        // create a port candidate at the right side of the node
        const candidates = new List<IPortCandidate>();
        const found = this.node.ports.filter(p => p.tag && (p.tag as IFlowPortViewModel).portType == PortType.OUTPUT);
        if (found.size === 0) {
            return candidates;
        }
        // const defaultPortCandidate: IPortCandidate = new DefaultPortCandidate(
        //     this.node,
        //     found.first().locationParameter
        // );
        // candidates.add(defaultPortCandidate);
        this.addExistingPorts(this.node, candidates);
        return candidates
    }

    /**
     * Returns a port candidate on the left side of the node where an edge can end.
     * @param {IInputModeContext} context - The context for which the candidates should be provided.
     * @returns {IEnumerable.<IPortCandidate>}
     */
    getAllTargetPortCandidates(context) {
        const candidates = new List<IPortCandidate>();
        const found = this.node.ports.filter(p => p.tag && (p.tag as IFlowPortViewModel).portType == PortType.INPUT);
        if (found.size === 0) {
            return candidates;
        }

        this.addExistingPorts(this.node, candidates);
        return candidates
    }

    /**
     * @param {IInputModeContext} context - The context for which the candidates should be provided.
     * @param {IPortCandidate} target - The opposite port candidate.
     * @returns {IEnumerable.<IPortCandidate>}
     */
    getSourcePortCandidates(context, target) {
        return this.getAllSourcePortCandidates(context)
    }

    /**
     * @param {IInputModeContext} context - The context for which the candidates should be provided.
     * @param {IPortCandidate} source - The opposite port candidate.
     * @returns {IEnumerable.<IPortCandidate>}
     */
    getTargetPortCandidates(context, source) {
        return this.getAllTargetPortCandidates(context)
    }
}
