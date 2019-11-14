import {IFlowNodeModel} from './IFlowNodeModel';
import {FlowModel} from './FlowModel';
import {Emitter, stream, Stream} from 'kefir';
import * as _ from 'lodash';
import {v4} from 'uuid';
import {StreamEvent} from './StreamEvent';

/**
 * The model of a flow node.
 */
export class FlowNodeModel implements IFlowNodeModel {


    public get model() {
        return this._model;
    }

    public get id() {
        if (_.isNil(this._id)) {
            this._id = v4();
        }
        return this._id;
    }

    public set id(v) {
        this._id = v;
    }
    private _id: string;


    private readonly _model: FlowModel;
    private readonly values: { [key: string]: string };
    // @ts-ignore
    private onChangeEmitter: Emitter;
    /**
     * Occurs whenever something happens on the in/out.
     */
    public onChange: Stream<any, never>;

    /**
     *
     * @param options {object} Can contain 'id' and 'name'.
     */
    constructor(id, model) {
        this._id = id;
        this._model = model;

        this.onChange = stream<any, never>(e => {
            this.onChangeEmitter = e;
        });
        this.onChange.observe(_.noop);
        this.values = {};
    }


    public setPropertyValue(name: string, value: any) {
        this.values[name] = value;
        this.onChangeEmitter.emit(new StreamEvent(name, value));
    }

    public getPropertyValue(name: string) {
        return this.values[name];
    }
}
