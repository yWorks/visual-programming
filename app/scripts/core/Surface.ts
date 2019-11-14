import {ISurface} from './ISurface';
import {BridgeCrossingStyle, BridgeManager, DefaultEdgePathCropper, Fill, GraphComponent, GraphEditorInputMode, GraphItemTypes, GraphObstacleProvider, HierarchicLayout, HierarchicNestingPolicy, ICanvasObjectDescriptor, IEdge, IGraph, INode, IPort, LayoutExecutor, License, ShapeNodeStyle, Size, TemplateNodeStyle} from 'yfiles';
import {IFlowModel} from './IFlowModel';
import {IFlowPortViewModel} from './IFlowPortViewModel';
import {IFlowNodeModel} from './IFlowNodeModel';
import {IStreamEvent} from './IStreamEvent';
import FlowEdgeViewModelImpl from './FlowEdgeViewModelImpl';
import {FlowModel} from './FlowModel';
import IFlowEdgeViewModel from './IFlowEdgeViewModel';
import RoutingEdgeStyle from '../style/EdgeStyle';
import PortCandidateProvider from '../style/PortCandidateProvider';
import * as _ from 'lodash';
import {BackGridStyle} from '../style/BackGridStyle';


/**
 * High-level API managing the flow.
 */
export class Surface implements ISurface {

    private createInteractions() {
        const mode = new GraphEditorInputMode();
        mode.showHandleItems = GraphItemTypes.ALL & ~GraphItemTypes.NODE;
        mode.createEdgeInputMode.useHitItemsCandidatesOnly = true;
        mode.allowCreateNode = false;
        mode.allowCreateEdge = true;
        mode.allowCreateBend = false;
        this.graphComponent.inputMode = mode;

        mode.addItemClickedListener((s, e) => {
            if (INode.isInstance(e.item)) {
                const node = e.item as INode;
                // check whether the enable/disable element is clicked
                if (node.tag.clickIsInEnabled(node.layout, e.location)) {
                    node.tag.enabled = !node.tag.enabled;
                }
            }
        });
        // mode.createEdgeInputMode.addEdgeCreatedListener((s,e)=>{
        //     this.startListeningToFlow(e.item);
        // });
        this.graph.addEdgeCreatedListener((s, e) => {
            this.startListeningToFlow(e.item);
        });
        this.graph.addNodeRemovedListener((s, e) => {

        });
        this.graph.addEdgeRemovedListener((s, e) => {
            // stop listening to changes on the source
            this.stopListeningToFlow(e.item);
        })
    }

    private stopListeningToFlow(item) {
        if (IEdge.isInstance(item)) {
            const vm = item.tag as IFlowEdgeViewModel;
            vm.subscription.unsubscribe();
        }
    }

    private startListeningToFlow(item) {
        if(!IEdge.isInstance(item)){
            return;
        }
        const edge = item as IEdge;
        const source = edge.sourcePort;
        const target = edge.targetPort;
        const sourcePortViewModel: IFlowPortViewModel = source.tag as IFlowPortViewModel;
        const targetPortViewModel: IFlowPortViewModel = target.tag as IFlowPortViewModel;
        const sourceModel: IFlowNodeModel = (source.tag as IFlowPortViewModel).getNodeModel();
        // pass the value from source to target
        const subscription = sourceModel.onChange.observe((e: IStreamEvent) => {
            if (sourcePortViewModel.name === e.name && targetPortViewModel.viewModel.enabled) {
                targetPortViewModel.setProperty(targetPortViewModel.name, e.value);
                // console.log(`${tpvm.name}: ${value.value}`)
                this.graph.invalidateDisplays();
            }

        });
        // the subscription is necessary to stop listening when disconnecting the edge
        const vm = new FlowEdgeViewModelImpl();
        vm.subscription = subscription;
        edge.tag = vm;
    }

    private defineBridges() {
        const bridgeManager = new BridgeManager();
        bridgeManager.canvasComponent = this.graphComponent;
        bridgeManager.defaultBridgeCrossingStyle = BridgeCrossingStyle.GAP;
        bridgeManager.addObstacleProvider(new GraphObstacleProvider())
    }

    private setStyle() {

        this.graph.edgeDefaults.style = new RoutingEdgeStyle(10, 10, '#636363', 1);
        this.graph.nodeDefaults.style = new ShapeNodeStyle({
            fill: Fill.ORANGE,
            shape: 'round-rectangle'
        });
        this.graph.nodeDefaults.size = new Size(70, 100);
        const nodeDecorator = this.graphComponent.graph.decorator.nodeDecorator;
        nodeDecorator.portCandidateProviderDecorator.setFactory(node => new PortCandidateProvider(node));

        this.graphComponent.graphModelManager.edgeGroup.toFront();
        this.graphComponent.graphModelManager.hierarchicNestingPolicy = HierarchicNestingPolicy.NODES;
        this.graph.nodeDefaults.style = new TemplateNodeStyle('SumTemplate');

        // crop the edge path at the port and not at the node bounds
        DefaultEdgePathCropper.isInstance(this.graph);

        // this.graphComponent.backgroundGroup.addChild(new BackGridStyle(),
        //     ICanvasObjectDescriptor.VISUAL);

        const decorator = this.graph.decorator;
        const pathCropper = new DefaultEdgePathCropper();
        pathCropper.cropAtPort = true;
        pathCropper.extraCropLength = 3;
        decorator.portDecorator.edgePathCropperDecorator.setImplementation(pathCropper);
        this.graph.nodeDefaults.ports.autoCleanUp = false;


        TemplateNodeStyle.CONVERTERS.enabledConverter = (value, parameter) => {
            // converts a bool into a color
            if (typeof value === 'boolean') {
                return value === true ? 'transparent' : '#FF0000'
            }
            return '#000000'
        };

        TemplateNodeStyle.CONVERTERS.Smart_Display = (value, parameter) => {
            if (_.isArray(value)) {
                const els = _.take(value, 2).join(', ');
                return `Array: ${els}...`;
            } else if (_.isString(value)) {

                const realValue = JSON.parse(value);
                if (_.isNumber(realValue)) {
                    return value;
                } else if (_.isArray(realValue)) {
                    const els = _.take(realValue, 2).join(', ');
                    return `Array: ${els}...`;
                } else {
                    if (value.length <= 10) {
                        return value;
                    }
                    return value.substring(10) + '...';
                }

            } else {
                return '?';
            }
        }
    }
    graph: IGraph;
    model: IFlowModel;
    graphComponent: GraphComponent;

    constructor() {
        this.model = new FlowModel();
        this.init();
    }

    init() {
        this.setLicense();
        this.createComponent();
        this.setStyle();
        this.defineBridges();
        this.createInteractions();
    }

    setLicense() {

        License.value = {
            'company': 'The Orbifold b.v.b.a.',
            'date': '10/22/2019',
            'distribution': true,
            'domains': [
                '*'
            ],
            'fileSystemAllowed': true,
            'licensefileversion': '1.1',
            'localhost': true,
            'oobAllowed': true,
            'package': 'complete',
            'product': 'yFiles for HTML',
            'projectname': 'yWorks Consulting',
            'subscription': '12/31/2020',
            'type': 'project',
            'version': '2.2',
            'key': 'd9568c2bdf4ebd16cf3d80a0edc8fe155ca5a38c'
        };
    }

    createComponent() {
        this.graphComponent = new GraphComponent('#graphComponent');
        this.graph = this.graphComponent.graph;

    }

    layout() {
        const executor = new LayoutExecutor({
            graphComponent: this.graphComponent,
            layout: new HierarchicLayout({
                layoutOrientation: 'left-to-right',
                gridSpacing: 0
            }),
            animateViewport: true,
            easedAnimation: true,
            duration: '0.5s',
            fixPorts: true,
        });

        executor.start().then( () => {
            this.graphComponent.fitContent();
            this.graphComponent.zoom = 3;
        });
    }

    connect(source: IPort, target: IPort): IEdge {
        // note that the `graph.addEdgeCreatedListener` takes are of the rest
        return this.graph.createEdge(source, target);
    }
}
