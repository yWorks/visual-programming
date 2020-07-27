import {FlowNodeViewModel} from '../../core/FlowNodeViewModel';
import {FlowPortViewModel} from '../../core/FlowPortViewModel';
import {PortType} from '../../core/PortType';
import {Point} from 'yfiles';
import {FlowNodeModel} from '../../core/FlowNodeModel';
import * as _ from 'lodash';
import {Material, Vector3} from '../../style/raytracer';

export class RaytraceFlowNodeViewModel extends FlowNodeViewModel {

    get material() {
        if (this._material.surfaceColor.equals(this.surfaceColor || new Vector3(0.0, 0.2, 0.8)) &&
            this._material.reflection === (this.reflection || 0.1) && this._material.transparency === (this.transparency || 0.05) &&
        this._material.emissionColor.equals(this.emissionColor || new Vector3(0.8, 0, 0))){
            return this._material
        }
        return this._material = new Material(this.surfaceColor || new Vector3(0.0, 0.2, 0.8), this.reflection || 0.1, this.transparency || 0.05, this.emissionColor || new Vector3(0.8, 0, 0));
    }

    get emissionColor(): any {
        return this._emissionColor;
    }

    set emissionColor(value: any) {
        if (_.isString(value)) {
            const found = this.parseVector3(value);
            this._emissionColor = found;
        } else {
            value.forEach(this.ensureUnitSize);
            this._emissionColor = new Vector3(value[0], value[1], value[2]);
        }
        this.firePropertyChanged('emissionColor');
        this.setPropertyValue('emissionColor', this._emissionColor);
    }

    get reflection(): any {
        return this._reflection;
    }

    set reflection(value: any) {
        value = this.parseUnit(value);
        this._reflection = value;
        this.firePropertyChanged('reflection');
        this.setPropertyValue('reflection', this._reflection);

    }

    get transparency(): any {
        return this._transparency;
    }

    set transparency(value: any) {
        value = this.parseUnit(value);
        this._transparency = value;
        this.firePropertyChanged('transparency');
        this.setPropertyValue('transparency', this._transparency);
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
            this._surfaceColor = new Vector3(value[0], value[1], value[2]);
        }
        this.firePropertyChanged('surfaceColor');
        this.setPropertyValue('surfaceColor', this._surfaceColor);
    }

    private _surfaceColor: Vector3;
    private _transparency: number;
    private _reflection: number;
    private _emissionColor: Vector3;
    private _material : Material;

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
        this.portViewModels['EmissionColor'] = new FlowPortViewModel('emissionColor', PortType.INPUT, this, new Point(0.0, 50 - 2));
        this.portViewModels['Reflection'] = new FlowPortViewModel('reflection', PortType.INPUT, this, new Point(0.0, 70 - 2));
        this.portViewModels['Transparency'] = new FlowPortViewModel('transparency', PortType.INPUT, this, new Point(0.0, 90 - 2));
        this.model.nodes[this.id] = new FlowNodeModel(this.id, this.model);
        this._material = new Material(this.surfaceColor || new Vector3(0.0, 0.2, 0.8), this.reflection || 0.1, this.transparency || 0.05, this.emissionColor || new Vector3(0.8, 0, 0));

    }


    update() {

    }

    parseUnit(x: any): number {
        if (_.isString(x)) {
            x = parseFloat(x);
        }
        this.ensureUnitSize(x);
        return x;
    }

    parseVector3(x: string): Vector3 {
        if (_.isString(x)) {
            const found = JSON.parse(x);
            if (_.isArray(found)) {
                if (found.length !== 3) {
                    throw new Error('Given string is not a Vector3 type.');
                }
                found.forEach(this.ensureUnitSize);
                return new Vector3(found[0], found[1], found[2]);
            }
        }
        throw new Error('Expected a Vector3 type.');
    }


}
