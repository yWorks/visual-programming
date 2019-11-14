import {IFlowNodeController} from './IFlowNodeController';
import {IFlowModel} from './IFlowModel';
import {ISurface} from './ISurface';
import {GeneralPath, INode, IPort, TemplatePortStyle} from 'yfiles';
import {IFlowNodeViewModel} from './IFlowNodeViewModel';

/**
 * Base implementation of {@link IFlowNodeController}.
 */
export abstract class FlowNodeController implements IFlowNodeController {

    public get enabled() {
        return this.viewModel.enabled;
    }

    public set enabled(v) {
        this.viewModel.enabled = v;
    }
    protected model: IFlowModel;
    protected surface: ISurface;
    protected outputStyle: TemplatePortStyle;
    protected inputStyle: TemplatePortStyle;
    protected viewModel: IFlowNodeViewModel;
    protected node:INode;
    protected constructor(  surface: ISurface) {
        this.model = surface.model;
        this.surface = surface;
        this.ports = {};
        const outlinePath = new GeneralPath();

        this.outputStyle = new TemplatePortStyle({
            renderTemplateId: 'outputPortStyle',
            renderSize: [10, 10],
            normalizedOutline: outlinePath
        });
        this.inputStyle = new TemplatePortStyle({
            renderTemplateId: 'inputPortStyle',
            renderSize: [10, 10],
            normalizedOutline: outlinePath
        });
    }
    public ports: { [key: string]: IPort };


}
