export const FRONTEND_EVENTS = {
    TIMETABLE_CHANGED: 'TIMETABLE_CHANGED'
} as const;

class FrontendEventBusClass extends EventTarget {
    emit(eventName: string, detail?: any) {
        this.dispatchEvent(new CustomEvent(eventName, { detail }));
    }

    on(eventName: string, listener: EventListenerOrEventListenerObject) {
        this.addEventListener(eventName, listener);
    }

    off(eventName: string, listener: EventListenerOrEventListenerObject) {
        this.removeEventListener(eventName, listener);
    }
}

export const FrontendEventBus = new FrontendEventBusClass();
