import { IAdminClassRepository } from '../../domain/repositories/IAdminClassRepository';

export class GetClassesByCourseUseCase {
    constructor(private adminClassRepository: IAdminClassRepository) {}

    async execute(semester: number, courseId: number): Promise<any[]> {
        return await this.adminClassRepository.getClassesByCourse(semester, courseId);
    }
}
