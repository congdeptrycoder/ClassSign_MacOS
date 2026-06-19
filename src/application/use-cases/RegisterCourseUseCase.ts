import { ICourseRegistrationRepository } from '../../domain/repositories/ICourseRegistrationRepository';

export class RegisterCourseUseCase {
    constructor(private readonly repository: ICourseRegistrationRepository) {}

    execute(studentId: number, courseId: number) {
        return this.repository.registerCourse(studentId, courseId);
    }
}
