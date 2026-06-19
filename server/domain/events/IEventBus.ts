export interface DomainEvent {
    eventName: string;
    occurredOn: Date;
}

export interface IEventBus {
    publish(event: DomainEvent): void;
    subscribe(eventName: string, handler: (event: DomainEvent) => void): void;
}
