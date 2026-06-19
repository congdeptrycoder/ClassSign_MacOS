import { DomainEvent } from './IEventBus';

export class ClassRegisteredEvent implements DomainEvent {
    public eventName = 'ClassRegisteredEvent';
    public occurredOn: Date;

    constructor(
        public readonly studentId: number,
        public readonly classId: number
    ) {
        this.occurredOn = new Date();
    }
}

export class ClassRegistrationCancelledEvent implements DomainEvent {
    public eventName = 'ClassRegistrationCancelledEvent';
    public occurredOn: Date;

    constructor(
        public readonly studentId: number,
        public readonly classId: number
    ) {
        this.occurredOn = new Date();
    }
}
