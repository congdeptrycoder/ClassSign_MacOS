import { ICourseRegistrationRepository } from '../../domain/repositories/ICourseRegistrationRepository';

export class GetCurriculumUseCase {
    constructor(private readonly repository: ICourseRegistrationRepository) {}

    execute(studentId: number) {
        if (!studentId || studentId <= 0) {
            throw new Error('Student ID không hợp lệ.');
        }
        return this.repository.getCurriculum(studentId);
    }
}
