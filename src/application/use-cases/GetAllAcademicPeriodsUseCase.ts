import { IAcademicPeriodRepository } from '../../domain/repositories/IAcademicPeriodRepository';
import { AcademicPeriodDTO } from '../dto/AcademicPeriodDTO';

export class GetAllAcademicPeriodsUseCase {
    constructor(private academicPeriodRepository: IAcademicPeriodRepository) {}

    async execute(): Promise<AcademicPeriodDTO[]> {
        const periods = await this.academicPeriodRepository.getAll();
        return periods.map(p => ({
            id: p.id,
            semester: p.semester,
            semester_name: p.semester_name,
            period_type: p.period_type,
            start_date: p.start_date,
            end_date: p.end_date,
            is_active: p.is_active,
        }));
    }
}
