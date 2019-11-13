import {FlowNodeController} from '../../core/FlowNodeController';
import {IFlowModel} from '../../core/IFlowModel';
import {ISurface} from '../../core/ISurface';
import {SpyFlowNodeViewModel} from './SpyFlowNodeViewModel';
import {FreeNodePortLocationModel, Rect, TemplateNodeStyle} from 'yfiles';

export class SpyFlowNodeController extends FlowNodeController {

    constructor(surface: ISurface) {
        super(surface);
        this.init();
    }

    public init() {
        this.viewModel = new SpyFlowNodeViewModel(this.model);
        this.node = this.surface.graph.createNode({
            layout: new Rect(0, 0, 70, 50),
            style: new TemplateNodeStyle('SpyTemplate'),
            tag: this.viewModel
        });
        const vmInput = this.viewModel.portViewModels['Input'];
        this.ports['Input'] = this.surface.graph.addPort({owner: this.node, locationParameter: FreeNodePortLocationModel.INSTANCE.createParameter(this.node, vmInput.position), style: this.inputStyle, tag: vmInput});


    }
}
