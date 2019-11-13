import {FlowNodeController} from '../../core/FlowNodeController';
import {ISurface} from '../../core/ISurface';
import {FreeNodePortLocationModel, Rect, TemplateNodeStyle} from 'yfiles';
import {BarChartFlowNodeViewModel} from './BarChartFlowNodeViewModel';
import D3ChartNodeStyle from '../../style/D3NodeStyle';

export class BarChartFlowNodeController extends FlowNodeController {

    constructor(  surface: ISurface) {
        super( surface);
        this.viewModel = new BarChartFlowNodeViewModel(this.model);

        this.node= this.surface.graph.createNode({
            style: new D3ChartNodeStyle(),
            layout: new Rect(0, 0, 70, 90),
            tag: this.viewModel
        });

        const vmInput = this.viewModel.portViewModels['Input'];
        this.ports['Input'] = this.surface.graph.addPort({owner:  this.node, locationParameter: FreeNodePortLocationModel.INSTANCE.createParameter( this.node, vmInput.position), style: this.inputStyle, tag: vmInput});

    }

}
