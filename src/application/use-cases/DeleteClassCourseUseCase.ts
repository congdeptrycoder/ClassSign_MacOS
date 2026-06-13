import { IAdminClassRepository } from '../../domain/repositories/IAdminClassRepository';

export class DeleteClassCourseUseCase {
    constructor(private adminClassRepository: IAdminClassRepository) {}

    async execute(classId: number): Promise<void> {
        await this.adminClassRepository.deleteClassCourse(classId);
    }
}
