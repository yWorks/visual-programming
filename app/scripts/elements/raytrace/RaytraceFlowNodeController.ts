import {FlowNodeController} from '../../core/FlowNodeController';
import {ISurface} from '../../core/ISurface';
import {FreeNodePortLocationModel, Rect} from 'yfiles';
import RaytraceNodeStyle from '../../style/RaytraceNodeStyle';
import {RaytraceFlowNodeViewModel} from './RaytraceFlowNodeViewModel';

export class RaytraceFlowNodeController extends FlowNodeController {

    constructor(  surface: ISurface) {
        super( surface);
        this.viewModel = new RaytraceFlowNodeViewModel(this.model);

        this.node= this.surface.graph.createNode({
            style: new RaytraceNodeStyle(),
            layout: new Rect(0, 0, 105, 150),
            tag: this.viewModel
        });

        const vmInput = this.viewModel.portViewModels['SurfaceColor'];
        this.ports['SurfaceColor'] = this.surface.graph.addPort({owner:  this.node, locationParameter: FreeNodePortLocationModel.INSTANCE.createParameter( this.node, vmInput.position), style: this.inputStyle, tag: vmInput});

    }

}
