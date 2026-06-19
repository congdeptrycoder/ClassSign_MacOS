import { useState, useCallback, useEffect } from 'react';
import { TimetableEntry } from '../../../domain/entities/StudentRegistration';
import { timetableController } from '../../../di/student.di';
import { FrontendEventBus, FRONTEND_EVENTS } from '../../../shared/utils/FrontendEventBus';

export interface TimeEvent {
    day: string;
    period: number;
    name: string;
}

export function parseTimetableEvents(entries: TimetableEntry[]): TimeEvent[] {
    return entries.flatMap(entry => {
        if (!entry.detail) return [];
        try {
            const detail = JSON.parse(entry.detail);
            if (detail.thu && detail.tiet_bd && detail.tiet_kt) {
                const dayStr = `T${detail.thu}`;
                let start = parseInt(detail.tiet_bd, 10);
                let end = parseInt(detail.tiet_kt, 10);
                if (isNaN(start) || isNaN(end)) return [];

                if (detail.buoi === 'Chiều') {
                    start += 6;
                    end += 6;
                }
                const events: TimeEvent[] = [];
                for (let i = start; i <= end; i++) {
                    events.push({ day: dayStr, period: i, name: entry.code });
                }
                return events;
            }
            const slots = Array.isArray(detail) ? detail : detail.slots;
            if (!Array.isArray(slots)) return [];

            return slots.flatMap((slot: any) => {
                const periods = Array.isArray(slot.periods) ? slot.periods : [slot.period].filter(Boolean);
                return periods.map((period: number) => ({ day: slot.day, period, name: entry.code }));
            });
        } catch (_err) {
            return [];
        }
    });
}

export const useTimetableViewModel = (studentId: number, semesterId?: string) => {
    const [registeredClasses, setRegisteredClasses] = useState<TimetableEntry[]>([]);
    const [timeGridEvents, setTimeGridEvents] = useState<TimeEvent[]>([]);

    const reloadTimetable = useCallback(async () => {
        try {
            const timetable = await timetableController.getTimetable(studentId, semesterId);
            setRegisteredClasses(timetable);
            setTimeGridEvents(parseTimetableEvents(timetable));
        } catch (error) {
            console.error('Không thể tải thời khóa biểu', error);
        }
    }, [studentId, semesterId]);

    useEffect(() => {
        reloadTimetable();

        const handleTimetableChange = () => {
            reloadTimetable();
        };

        FrontendEventBus.on(FRONTEND_EVENTS.TIMETABLE_CHANGED, handleTimetableChange);

        return () => {
            FrontendEventBus.off(FRONTEND_EVENTS.TIMETABLE_CHANGED, handleTimetableChange);
        };
    }, [reloadTimetable]);

    return { registeredClasses, timeGridEvents, reloadTimetable };
};
