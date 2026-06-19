import { DomainEvent } from '../domain/events/IEventBus';
import { ClassRegisteredEvent } from '../domain/events/ClassRegistrationEvents';
import { BackendEventBus } from '../infrastructure/events/EventBusImpl';
import { dbGet } from '../utils/db.utils';

export function registerClassCapacityWarningSubscriber() {
    BackendEventBus.subscribe('ClassRegisteredEvent', async (event: DomainEvent) => {
        if (event instanceof ClassRegisteredEvent) {
            try {
                const classSection = await dbGet<any>(
                    `SELECT id, occupied_slots, total_slots FROM classes_course WHERE id = ?`, 
                    [event.classId]
                );
                if (classSection && classSection.occupied_slots >= classSection.total_slots) {
                    console.warn(`[WARNING] Class ${event.classId} is full (${classSection.occupied_slots}/${classSection.total_slots}). Admin attention might be required.`);
                    // Tương lai có thể push notification cho Admin
                }
            } catch (err) {
                console.error('Error in ClassCapacityWarningSubscriber', err);
            }
        }
    });
}
