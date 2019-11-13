import {FlowNodeController} from '../../core/FlowNodeController';
import {ISurface} from '../../core/ISurface';
import {RandomFlowNodeViewModel, RandomMode} from './RandomFlowNodeViewModel';
import {FreeNodePortLocationModel, Rect, TemplateNodeStyle} from 'yfiles';

export class RandomFlowNodeController extends FlowNodeController {
    get mode(): RandomMode {
        return (this.viewModel as RandomFlowNodeViewModel).mode;
    }

    set mode(value: RandomMode) {
        (this.viewModel as RandomFlowNodeViewModel).mode = value;
    }

    constructor( surface: ISurface) {
        super( surface);
        this.init();
    }


    private init() {
        this.viewModel = new RandomFlowNodeViewModel(this.model);
        this.node = this.surface.graph.createNode({
            layout: new Rect(0, 0, 70, 50),
            style: new TemplateNodeStyle('RandomTemplate'),
            tag: this.viewModel
        });
        this.mode = RandomMode.NUNBER;

        const vmOutput = this.viewModel.portViewModels['Output'];
        this.ports['Output'] = this.surface.graph.addPort({owner:  this.node, locationParameter: FreeNodePortLocationModel.INSTANCE.createParameter( this.node, vmOutput.position), style: this.outputStyle, tag: vmOutput});
        vmOutput.port =  this.ports['Output'];
    }
}
