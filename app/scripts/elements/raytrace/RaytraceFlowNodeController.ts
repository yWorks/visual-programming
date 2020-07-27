import {FlowNodeController} from '../../core/FlowNodeController';
import {ISurface} from '../../core/ISurface';
import {FreeNodePortLocationModel, Rect} from 'yfiles';
import RaytraceNodeStyle from '../../style/RaytraceNodeStyle';
import {RaytraceFlowNodeViewModel} from './RaytraceFlowNodeViewModel';

export class RaytraceFlowNodeController extends FlowNodeController {

    constructor(surface: ISurface) {
        super(surface);
        this.viewModel = new RaytraceFlowNodeViewModel(this.model);

        this.node = this.surface.graph.createNode({
            style: new RaytraceNodeStyle(),
            layout: new Rect(0, 0, 105, 150),
            tag: this.viewModel
        });

        const surfaceColorInput = this.viewModel.portViewModels['SurfaceColor'];
        const emissionColorInput = this.viewModel.portViewModels['EmissionColor'];
        //const transparencyInput = this.viewModel.portViewModels['Transparency'];
        //const reflectionInput = this.viewModel.portViewModels['Reflection'];
        this.ports['SurfaceColor'] = this.surface.graph.addPort({owner: this.node, locationParameter: FreeNodePortLocationModel.INSTANCE.createParameter(this.node, surfaceColorInput.position), style: this.inputStyle, tag: surfaceColorInput});
        this.ports['EmissionColor'] = this.surface.graph.addPort({owner: this.node, locationParameter: FreeNodePortLocationModel.INSTANCE.createParameter(this.node, emissionColorInput.position), style: this.inputStyle, tag: emissionColorInput});
        // posted an issue, these params seem not to work in the raytracer
        //this.ports['Transparency'] = this.surface.graph.addPort({owner: this.node, locationParameter: FreeNodePortLocationModel.INSTANCE.createParameter(this.node, transparencyInput.position), style: this.inputStyle, tag: transparencyInput});
        //this.ports['Reflection'] = this.surface.graph.addPort({owner: this.node, locationParameter: FreeNodePortLocationModel.INSTANCE.createParameter(this.node, reflectionInput.position), style: this.inputStyle, tag: reflectionInput});

    }

}
