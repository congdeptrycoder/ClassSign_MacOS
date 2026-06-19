import { EventEmitter } from 'events';
import { DomainEvent, IEventBus } from '../../domain/events/IEventBus';

export class EventBusImpl implements IEventBus {
    private emitter = new EventEmitter();

    publish(event: DomainEvent): void {
        this.emitter.emit(event.eventName, event);
    }

    subscribe(eventName: string, handler: (event: DomainEvent) => void): void {
        this.emitter.on(eventName, handler);
    }
}

// Global instance for backend
export const BackendEventBus = new EventBusImpl();
