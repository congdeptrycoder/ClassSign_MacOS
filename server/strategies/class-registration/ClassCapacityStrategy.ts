import { IValidationStrategy } from '../IValidationStrategy';
import { ClassRegistrationContext } from './ClassRegistrationContext';
import { dbGet } from '../../utils/db.utils';

export class ClassCapacityStrategy implements IValidationStrategy<ClassRegistrationContext> {
    async validate(context: ClassRegistrationContext): Promise<void> {
        const classSection = await dbGet<any>(
            `
              SELECT
                id,
                course_id as courseId,
                total_slots as totalSlots,
                occupied_slots as occupiedSlots,
                detail
              FROM classes_course
              WHERE id = ?
            `,
            [context.classId]
        );

        if (!classSection) {
            throw new Error('Lớp học phần không tồn tại.');
        }

        if (classSection.occupiedSlots >= classSection.totalSlots) {
            throw new Error('Lớp học phần đã hết chỗ.');
        }

        // Cache classSection for subsequent strategies
        context.classSection = classSection;
    }
}
