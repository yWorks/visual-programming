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
import {SumFlowNodeController} from "./elements/sum/SumFlowNodeController";


Class.ensure(LayoutExecutor);

class App {
    surface: ISurface;

    constructor() {
        this.surface = new Surface();
        this.createSampleGraph();
    }

    createSampleGraph() {

         const rs1 = new RandomFlowNodeController(this.surface);
         rs1.mode = RandomMode.NUNBER
         const rs2 = new RandomFlowNodeController(this.surface);
        rs2.mode = RandomMode.NUNBER
         const sum = new SumFlowNodeController(this.surface);
         const sumSpy = new SpyFlowNodeController(this.surface);
        this.surface.connect(rs1.ports['Output'], sum.ports['Input1']);
        this.surface.connect(rs2.ports['Output'], sum.ports['Input2']);
        this.surface.connect(sum.ports['Output'], sumSpy.ports['Input']);
        sumSpy.enabled = false;


        const r1 = new RandomFlowNodeController(this.surface);
        r1.mode = RandomMode.VECTOR3;
        const r2 = new RandomFlowNodeController(this.surface);
        r2.mode = RandomMode.VECTOR3;
        const r3 = new RandomFlowNodeController(this.surface);
        r3.mode = RandomMode.UNIT;
        const r4 = new RandomFlowNodeController(this.surface);
        r4.mode = RandomMode.NUMBER_ARRAY;
        const barchart = new BarChartFlowNodeController(this.surface);
        this.surface.connect(r4.ports['Output'], barchart.ports['Input']);
        const spy = new SpyFlowNodeController(this.surface);
        this.surface.connect(r3.ports['Output'], spy.ports['Input']);
        const ray = new RaytraceFlowNodeController(this.surface);
        this.surface.connect(r1.ports['Output'], ray.ports['SurfaceColor']);
        this.surface.connect(r2.ports['Output'], ray.ports['EmissionColor']);
        this.surface.layout();
    }

}

new App();
