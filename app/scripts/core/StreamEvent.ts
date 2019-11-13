import {IStreamEvent} from './IStreamEvent';

export class StreamEvent implements IStreamEvent {
    constructor(public name: string, public value: any) {
    }
}
