import {FlowNodeController} from '../../core/FlowNodeController';
import {IFlowModel} from '../../core/IFlowModel';
import {ISurface} from '../../core/ISurface';
import {SumFlowNodeViewModel} from './SumFlowNodeViewModel';
import {FreeNodePortLocationModel, Rect, TemplateNodeStyle} from 'yfiles';

export class SumFlowNodeController extends FlowNodeController {

    constructor(model: IFlowModel, surface: ISurface) {
        super(model, surface);
        this.init();
    }

    public init() {
        this.viewModel = new SumFlowNodeViewModel(this.model);
        this.node = this.surface.graph.createNode({
            layout: new Rect(0, 0, 70, 70),
            style: new TemplateNodeStyle('SumTemplate'),
            tag: this.viewModel
        });

        const vmOutput = this.viewModel.portViewModels['Output'];
        const vmInput1 = this.viewModel.portViewModels['Input1'];
        const vmInput2 = this.viewModel.portViewModels['Input2'];
        this.ports['Output'] = this.surface.graph.addPort({owner:  this.node, locationParameter: FreeNodePortLocationModel.INSTANCE.createParameter( this.node, vmOutput.position), style: this.outputStyle, tag: vmOutput});
        this.ports['Input1'] = this.surface.graph.addPort({owner:  this.node, locationParameter: FreeNodePortLocationModel.INSTANCE.createParameter( this.node, vmInput1.position), style: this.inputStyle, tag: vmInput1});
        this.ports['Input2'] = this.surface.graph.addPort({owner:  this.node, locationParameter: FreeNodePortLocationModel.INSTANCE.createParameter( this.node, vmInput2.position), style: this.inputStyle, tag: vmInput2});


    }
}
