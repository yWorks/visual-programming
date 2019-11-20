import 'yfiles/yfiles.css';
import RoutingEdgeStyle from './style/edgeStyle';
import PortCandidateProvider from './style/PortCandidateProvider';
import {FlowModel} from './core/FlowModel';
import {RandomFlowNodeController} from './elements/random/RandomFlowNodeController';
import {Surface} from './core/Surface';
import {BarChartFlowNodeController} from './elements/barchart/BarChartFlowNodeController';
import {RandomMode} from './elements/random/RandomFlowNodeViewModel';
import {Class, LayoutExecutor} from 'yfiles';
import {ISurface} from './core/ISurface';
import {SpyFlowNodeController} from './elements/spy/SpyFlowNodeController';
import {RaytraceFlowNodeController} from './elements/raytrace/RaytraceFlowNodeController';


Class.ensure(LayoutExecutor);

class App {
    surface: ISurface;

    constructor() {
        this.surface = new Surface();
        this.createSampleGraph();
    }

    createSampleGraph() {

        // const r = new RandomFlowNodeController(model, surface);
        // r.create();
        // const r2 = new RandomFlowNodeController(model, surface);
        // r2.create();
        // const sum = new SumFlowNodeController(model, surface);
        // sum.create();
        // const spy = new SpyFlowNodeController(model, surface);
        // spy.create();
        // surface.connect(r.ports['Output'], sum.ports['Input1']);
        // surface.connect(r2.ports['Output'], sum.ports['Input2']);
        // surface.connect(sum.ports['Output'], spy.ports['Input']);
        // spy.enabled = false;


        const r1 = new RandomFlowNodeController(this.surface);
        r1.mode = RandomMode.VECTOR3;
        const r2 = new RandomFlowNodeController(this.surface);
        r2.mode = RandomMode.VECTOR3;
        // const r3 = new RandomFlowNodeController(this.surface);
        // r3.mode = RandomMode.UNIT;
        // const barchart = new BarChartFlowNodeController(this.surface);
        // this.surface.connect(random.ports['Output'], barchart.ports['Input']);
        // const spy = new SpyFlowNodeController(this.surface);
        // this.surface.connect(random.ports['Output'], spy.ports['Input']);
        const ray = new RaytraceFlowNodeController(this.surface);
        this.surface.connect(r1.ports['Output'], ray.ports['SurfaceColor']);
        this.surface.connect(r2.ports['Output'], ray.ports['EmissionColor']);
        // this.surface.connect(r3.ports['Output'], ray.ports['Reflection']);
        this.surface.layout();
    }

}

new App();
