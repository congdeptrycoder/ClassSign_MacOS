import { IAdminClassRepository } from '../../domain/repositories/IAdminClassRepository';
import { SaveClassCourseInputDTO } from '../dto/AdminClassDTO';

export class UpdateClassCourseUseCase {
    constructor(private repository: IAdminClassRepository) {}

    async execute(id: number, data: SaveClassCourseInputDTO): Promise<void> {
        if (!id) {
            throw new Error("Missing class ID for update.");
        }
        await this.repository.updateClassCourse(id, data);
    }
}
