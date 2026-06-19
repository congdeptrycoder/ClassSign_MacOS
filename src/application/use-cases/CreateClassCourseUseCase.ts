import { IAdminClassRepository } from '../../domain/repositories/IAdminClassRepository';
import { SaveClassCourseInputDTO } from '../dto/AdminClassDTO';

export class CreateClassCourseUseCase {
    constructor(private adminClassRepository: IAdminClassRepository) {}

    async execute(data: SaveClassCourseInputDTO): Promise<void> {
        await this.adminClassRepository.createClassCourse(data);
    }
}
