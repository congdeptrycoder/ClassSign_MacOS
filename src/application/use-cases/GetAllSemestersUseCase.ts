import { ISemesterRepository } from '../../domain/repositories/ISemesterRepository';
import { SemesterDTO } from '../dto/SemesterDTO';

export class GetAllSemestersUseCase {
    constructor(private semesterRepository: ISemesterRepository) {}

    async execute(): Promise<SemesterDTO[]> {
        const semesters = await this.semesterRepository.getAll();
        return semesters.map(s => ({
            id: s.id,
            semester: s.semester,
            is_active: s.is_active,
        }));
    }
}
