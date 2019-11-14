import {IFlowNodeViewModel} from './IFlowNodeViewModel';
import {BaseClass, delegate, IPropertyObservable, Point, PropertyChangedEventArgs} from 'yfiles';
import {v4} from 'uuid';
import {IFlowModel} from './IFlowModel';
import {IFlowPortViewModel} from './IFlowPortViewModel';

/**
 * The view-model of an element.
 */
export class FlowNodeViewModel extends BaseClass<IPropertyObservable>(IPropertyObservable) implements IFlowNodeViewModel {

    /** @inheritdoc */
    get enabled(): boolean {
        return this._enabled;
    }

    /** @inheritdoc */
    set enabled(value: boolean) {
        this._enabled = value;
        this.firePropertyChanged('enabled');
    }


    get id(): string {
        return this._id;
    }

    public get title(): string {
        return this._title;
    }

    get model(): IFlowModel {
        return this._model;
    }

    private _propertyChanged: any;

    private readonly _title: string;
    private readonly _id: string;
    private readonly _model: IFlowModel;

    protected _enabled: boolean;

    /**
     * Firest the PropertyChanged event.
     * @param propertyName The name of the property that has changed
     */
    protected firePropertyChanged(propertyName) {
        if (this._propertyChanged !== null) {
            this._propertyChanged(this, new PropertyChangedEventArgs(propertyName))
        }
    }

    public portViewModels: { [key: string]: IFlowPortViewModel };

    constructor(title, model) {
        super();
        this._id = v4();
        this._model = model;
        this._title = title;
        this._propertyChanged = null;
        this._enabled = true;
        this.portViewModels = {};
    }

    /**
     * Adds a listener to the PropertyChanged event.
     * @param {function(*,PropertyChangedEventArgs):void} listener - The listener to add.
     */
    addPropertyChangedListener(listener) {
        this._propertyChanged = delegate.combine(this._propertyChanged, listener)
    }

    /**
     * Removes a listener from the PropertyChanged event.
     * @param {function(*,PropertyChangedEventArgs):void} listener - The listener to remove.
     */
    removePropertyChangedListener(listener) {
        this._propertyChanged = delegate.remove(this._propertyChanged, listener)
    }

    setPropertyValue(name, value) {
        this.model.nodes[this.id].setPropertyValue(name, value);
    }

    clickIsInEnabled(rec, clickPoint) {
        const radius = 4;
        const p = new Point(rec.x + 60, rec.y + 10);
        return Math.pow(p.x - clickPoint.x, 2) + Math.pow(p.y - clickPoint.y, 2) <= Math.pow(radius, 2);

    }
}
