import { IAdminClassRepository } from '../../domain/repositories/IAdminClassRepository';

export class GetClassesByCourseUseCase {
    constructor(private adminClassRepository: IAdminClassRepository) {}

    async execute(semester: number, courseId: number): Promise<any[]> {
        if (!semester || semester <= 0) {
            throw new Error('Mã học kỳ không hợp lệ.');
        }
        if (!courseId || courseId <= 0) {
            throw new Error('ID học phần không hợp lệ.');
        }
        return await this.adminClassRepository.getClassesByCourse(semester, courseId);
    }
}
