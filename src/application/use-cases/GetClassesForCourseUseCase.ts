import { IClassRegistrationRepository } from '../../domain/repositories/IClassRegistrationRepository';

export class GetClassesForCourseUseCase {
    constructor(private readonly repository: IClassRegistrationRepository) {}

    execute(studentId: number, courseId: number) {
        if (!studentId || studentId <= 0) {
            throw new Error('Student ID không hợp lệ.');
        }
        if (!courseId || courseId <= 0) {
            throw new Error('Course ID không hợp lệ.');
        }
        return this.repository.getClassesForCourse(studentId, courseId);
    }
}
