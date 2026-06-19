import { IClassRegistrationRepository } from '../../domain/repositories/IClassRegistrationRepository';

export class GetClassesForCourseUseCase {
    constructor(private readonly repository: IClassRegistrationRepository) {}

    execute(studentId: number, courseId: number) {
        return this.repository.getClassesForCourse(studentId, courseId);
    }
}
