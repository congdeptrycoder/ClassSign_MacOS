import { IAdminClassRepository } from '../../domain/repositories/IAdminClassRepository';

export class UpdateClassCourseUseCase {
    constructor(private repository: IAdminClassRepository) {}

    async execute(id: number, data: any): Promise<void> {
        if (!id) {
            throw new Error("Missing class ID for update.");
        }
        await this.repository.updateClassCourse(id, data);
    }
}
