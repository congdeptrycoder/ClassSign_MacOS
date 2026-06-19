import { ICourseRegistrationRepository } from '../../domain/repositories/ICourseRegistrationRepository';

export class CancelCourseRegistrationUseCase {
    constructor(private readonly repository: ICourseRegistrationRepository) {}

    execute(studentId: number, courseId: number) {
        return this.repository.cancelCourseRegistration(studentId, courseId);
    }
}
