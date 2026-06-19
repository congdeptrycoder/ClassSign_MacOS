import fs from 'fs';
import path from 'path';
import { DomainEvent } from '../domain/events/IEventBus';
import { ClassRegisteredEvent, ClassRegistrationCancelledEvent } from '../domain/events/ClassRegistrationEvents';
import { BackendEventBus } from '../infrastructure/events/EventBusImpl';

const LOG_DIR = path.join(__dirname, '../../logs');
const LOG_FILE = path.join(LOG_DIR, 'registration_audit.log');

if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

export function registerAuditLogSubscriber() {
    const handler = (event: DomainEvent) => {
        let message = '';
        if (event instanceof ClassRegisteredEvent) {
            message = `[${event.occurredOn.toISOString()}] Student ${event.studentId} REGISTERED Class ${event.classId}\n`;
        } else if (event instanceof ClassRegistrationCancelledEvent) {
            message = `[${event.occurredOn.toISOString()}] Student ${event.studentId} CANCELLED Class ${event.classId}\n`;
        }
        
        if (message) {
            fs.appendFile(LOG_FILE, message, (err) => {
                if (err) console.error('Failed to write audit log', err);
            });
        }
    };

    BackendEventBus.subscribe('ClassRegisteredEvent', handler);
    BackendEventBus.subscribe('ClassRegistrationCancelledEvent', handler);
}
