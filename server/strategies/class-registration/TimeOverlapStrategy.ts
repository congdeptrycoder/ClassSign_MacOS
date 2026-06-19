import { IValidationStrategy } from '../IValidationStrategy';
import { ClassRegistrationContext } from './ClassRegistrationContext';
import { dbGet } from '../../utils/db.utils';
import { parseSchedule } from '../../utils/registration.utils';

export class TimeOverlapStrategy implements IValidationStrategy<ClassRegistrationContext> {
    async validate(context: ClassRegistrationContext): Promise<void> {
        if (!context.classSection) {
            throw new Error('Thiếu thông tin lớp học phần.');
        }

        const classDetailObj = JSON.parse(context.classSection.detail || '{}');
        const classBuoi = classDetailObj.buoi;
        const classSlots = parseSchedule(context.classSection.detail);

        for (const slot of classSlots) {
            if (!slot.periods || slot.periods.length === 0) continue;
            
            const startPeriod = Math.min(...slot.periods);
            const endPeriod = Math.max(...slot.periods);
            const day = String(slot.day);
            
            const overlapQuery = `
              SELECT co.course_code, co.course_name
              FROM student_class_registrations scr
              JOIN classes_course c ON scr.class_id = c.id
              JOIN courses co ON c.course_id = co.id
              WHERE scr.student_id = ?
                AND CAST(json_extract(c.detail, '$.thu') AS TEXT) = ?
                AND CAST(json_extract(c.detail, '$.buoi') AS TEXT) = ?
                AND CAST(json_extract(c.detail, '$.tiet_bd') AS INTEGER) <= ?
                AND CAST(json_extract(c.detail, '$.tiet_kt') AS INTEGER) >= ?
              LIMIT 1
            `;
            
            const overlap = await dbGet<any>(overlapQuery, [
              context.studentId,
              day,
              classBuoi,
              endPeriod,
              startPeriod
            ]);
            
            if (overlap) {
              throw new Error(`Trùng lịch với lớp ${overlap.course_code} (${overlap.course_name}).`);
            }
        }
    }
}
