import { ICourseRegistrationRepository } from '../../domain/repositories/ICourseRegistrationRepository';

export class GetCurriculumUseCase {
    constructor(private readonly repository: ICourseRegistrationRepository) {}

    execute(studentId: number) {
        return this.repository.getCurriculum(studentId);
    }
}
