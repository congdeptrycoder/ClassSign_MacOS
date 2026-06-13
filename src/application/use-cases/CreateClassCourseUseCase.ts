import { IAdminClassRepository } from '../../domain/repositories/IAdminClassRepository';

export class CreateClassCourseUseCase {
    constructor(private adminClassRepository: IAdminClassRepository) {}

    async execute(data: any): Promise<void> {
        await this.adminClassRepository.createClassCourse(data);
    }
}
