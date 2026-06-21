export const FRONTEND_EVENTS = {
    TIMETABLE_CHANGED: 'TIMETABLE_CHANGED',
    CLASS_SLOTS_CHANGED: 'CLASS_SLOTS_CHANGED',  // emitted after register/cancel a class section
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
