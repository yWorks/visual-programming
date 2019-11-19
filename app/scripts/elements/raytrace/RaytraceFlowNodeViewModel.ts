import {FlowNodeViewModel} from '../../core/FlowNodeViewModel';
import {FlowPortViewModel} from '../../core/FlowPortViewModel';
import {PortType} from '../../core/PortType';
import {Point} from 'yfiles';
import {FlowNodeModel} from '../../core/FlowNodeModel';
import * as _ from 'lodash';
import {Material, Vector3} from '../../style/raytracer';

export class RaytraceFlowNodeViewModel extends FlowNodeViewModel {

    get material() {
        return new Material(this.surfaceColor, 0.1, 0.05, new Vector3(0.8, 0, 0));
    }

    get emissionColor(): any {
        return this._emissionColor;
    }

    set emissionColor(value: any) {
        value.forEach(this.ensureUnitSize);
        this._emissionColor = value;
    }

    get reflection(): number {
        return this._reflection;
    }

    set reflection(value: number) {
        this.ensureUnitSize(value);
        this._reflection = value;
    }

    get transparency(): number {
        return this._transparency;
    }

    set transparency(value: number) {
        this.ensureUnitSize(value);
        this._transparency = value;
    }

    get surfaceColor(): any {
        return this._surfaceColor;
    }

    set surfaceColor(value: any) {
        if (_.isString(value)) {
            const found = this.parseVector3(value);
            this._surfaceColor = found;
        } else {
            value.forEach(this.ensureUnitSize);
            this._surfaceColor = new Vector3(value[0],value[1],value[2]);
        }
        this.firePropertyChanged('surfaceColor');
        this.setPropertyValue('surfaceColor', this._surfaceColor);
    }

    private _surfaceColor: Vector3;
    private _transparency: number;
    private _reflection: number;
    private _emissionColor: Vector3;

    private ensureUnitSize(x: number) {
        if (_.isNil(x)) {
            throw new Error('Nil material value.');
        }
        if (x < 0.0 || x > 1.0) {
            throw new Error('Material values should sit in the [0,1] interval.');
        }
    }

    constructor(model) {
        super('Raytracer', model);

        this.portViewModels['SurfaceColor'] = new FlowPortViewModel('surfaceColor', PortType.INPUT, this, new Point(0.0, 30 - 2));
        this.model.nodes[this.id] = new FlowNodeModel(this.id, this.model);

    }


    update() {

    }


    parseVector3(x: string): Vector3 {
        if (_.isString(x)) {
            const found = JSON.parse(x);
            if (_.isArray(found)) {
                if (found.length !== 3) {
                    throw new Error('Given string is not a Vector3 type.');
                }
                found.forEach(this.ensureUnitSize);
                return new Vector3(found[0],found[1],found[2]);
            }
        }
        throw new Error('Expected a Vector3 type.');
    }


}
