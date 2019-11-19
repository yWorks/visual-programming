import {FlowNodeViewModel} from '../../core/FlowNodeViewModel';
import {IFlowPortViewModel} from '../../core/IFlowPortViewModel';
import * as faker from 'faker';
import {FlowPortViewModel} from '../../core/FlowPortViewModel';
import {PortType} from '../../core/PortType';
import {Point} from 'yfiles';
import {FlowNodeModel} from '../../core/FlowNodeModel';
import * as _ from 'lodash';

export enum RandomMode {
    NUNBER,
    NUMBER_ARRAY,
    VECTOR3
}

export interface IRandomGenerator {
    generate(): string;
}

export class RandomNumberGenerator implements IRandomGenerator {
    generate(): string {
        return faker.random.number({min: 0, max: 100}).toString();
    }
}

export class RandomNumberArrayGenerator implements IRandomGenerator {
    private numGen: RandomNumberGenerator;

    constructor() {
        this.numGen = new RandomNumberGenerator();
    }

    generate(amount = 10): string {
        const ar = _.range(amount).map(i => {
            return this.numGen.generate();
        });
        return JSON.stringify(ar);
    }
}

export class Vector3Generator implements IRandomGenerator {

    constructor() {

    }

    generate(amount = 10): string {
        return JSON.stringify([Math.random(), Math.random(), Math.random()]);
    }
}

export class RandomFlowNodeViewModel extends FlowNodeViewModel {
    get mode(): RandomMode {
        return this._mode;
    }

    set mode(value: RandomMode) {
        this._mode = value;
        this.firePropertyChanged('mode');
        this.setPropertyValue('mode', value);
        this.update();
    }

    set enabled(v: boolean) {
        this._enabled = v;
        this.firePropertyChanged('enabled');
        this.update();
    }

    get enabled(): boolean {
        return this._enabled;
    }

    public get output(): IFlowPortViewModel {
        return this._output;
    }

    public set value(value: string) {
        this._value = value;
        this.firePropertyChanged('value');
        this.setPropertyValue('value', value);
    }

    public get value(): string {
        return this._value;

    }

    private ticker: any;
    private _mode: RandomMode;
    private readonly _output: IFlowPortViewModel;
    private generator: IRandomGenerator;

    private _value: string;

    constructor(model) {
        super('Random', model);

        this.portViewModels['Output'] = new FlowPortViewModel('value', PortType.OUTPUT, this, new Point(70.0, 30 - 2));
        this.model.nodes[this.id] = new FlowNodeModel(this.id, this.model);
        this.mode = RandomMode.NUNBER;
        this.enabled = true;
    }

    update() {
        if (this.enabled === true) {
            if (!_.isNil(this.ticker)) {
                clearInterval(this.ticker);
            }
            switch (this.mode) {
                case RandomMode.NUMBER_ARRAY:
                    this.generator = new RandomNumberArrayGenerator();
                    break;
                case RandomMode.VECTOR3:
                    this.generator = new Vector3Generator();
                    break;
                case RandomMode.NUNBER:
                    this.generator = new RandomNumberGenerator();
                    break;

            }
            this.ticker = setInterval(() => {
                this.value = this.generator.generate();
            }, 3000);


        } else {
            clearInterval(this.ticker);
            this.ticker = null;
        }
    }

}
