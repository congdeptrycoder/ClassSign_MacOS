import { IAdminClassRepository } from '../../domain/repositories/IAdminClassRepository';

export class GetAllClassesBySemesterUseCase {
    constructor(private adminClassRepository: IAdminClassRepository) {}

    async execute(semester: number): Promise<any[]> {
        if (!semester || semester <= 0) {
            throw new Error('Mã học kỳ không hợp lệ.');
        }
        return await this.adminClassRepository.getAllClassesBySemester(semester);
    }
}
