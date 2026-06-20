import { IAdminClassRepository } from '../../domain/repositories/IAdminClassRepository';

export class DeleteClassCourseUseCase {
    constructor(private adminClassRepository: IAdminClassRepository) {}

    async execute(classId: number): Promise<void> {
        if (!classId || classId <= 0) {
            throw new Error('ID lớp học không hợp lệ.');
        }
        await this.adminClassRepository.deleteClassCourse(classId);
    }
}
