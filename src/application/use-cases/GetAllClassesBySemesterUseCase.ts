import { IAdminClassRepository } from '../../domain/repositories/IAdminClassRepository';

export class GetAllClassesBySemesterUseCase {
    constructor(private adminClassRepository: IAdminClassRepository) {}

    async execute(semester: number): Promise<any[]> {
        return await this.adminClassRepository.getAllClassesBySemester(semester);
    }
}
