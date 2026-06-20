import { ICourseRegistrationRepository } from '../../domain/repositories/ICourseRegistrationRepository';

export class CancelCourseRegistrationUseCase {
    constructor(private readonly repository: ICourseRegistrationRepository) {}

    execute(studentId: number, courseId: number) {
        if (!studentId || studentId <= 0) {
            throw new Error('Student ID không hợp lệ.');
        }
        if (!courseId || courseId <= 0) {
            throw new Error('Course ID không hợp lệ.');
        }
        return this.repository.cancelCourseRegistration(studentId, courseId);
    }
}
