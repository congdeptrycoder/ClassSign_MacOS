import { ICourseRegistrationRepository } from '../../domain/repositories/ICourseRegistrationRepository';

export class GetRegisteredCoursesUseCase {
    constructor(private readonly repository: ICourseRegistrationRepository) {}

    execute(studentId: number) {
        return this.repository.getRegisteredCourses(studentId);
    }
}
