import {BaseClass, DefaultPortCandidate, IEnumerable, IInputModeContext, INode, IPortCandidate, IPortCandidateProvider, List, PortCandidateProviderBase} from 'yfiles';
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

        const candidates = new List<IPortCandidate>();
        // add all
        this.addExistingPorts(this.node, candidates);
        // but keep only the output
        return  candidates.filter(p => p.port.tag && (p.port.tag as IFlowPortViewModel).portType == PortType.OUTPUT)
    }

    /**
     * Returns a port candidate on the left side of the node where an edge can end.
     * @param {IInputModeContext} context - The context for which the candidates should be provided.
     * @returns {IEnumerable.<IPortCandidate>}
     */
    getAllTargetPortCandidates(context) {
        const candidates = new List<IPortCandidate>();
        // add all
        this.addExistingPorts(this.node, candidates);
        // but keep only the output
        return  candidates.filter(p => p.port.tag && (p.port.tag as IFlowPortViewModel).portType == PortType.INPUT);
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

    getPortCandidates(context: IInputModeContext): IEnumerable<IPortCandidate> {
        return undefined;
    }
}
