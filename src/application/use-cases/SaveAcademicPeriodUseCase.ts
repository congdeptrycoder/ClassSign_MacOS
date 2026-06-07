import { IAcademicPeriodRepository } from '../../domain/repositories/IAcademicPeriodRepository';
import { SaveAcademicPeriodInputDTO } from '../dto/AcademicPeriodDTO';

export class SaveAcademicPeriodUseCase {
    constructor(private academicPeriodRepository: IAcademicPeriodRepository) {}

    async execute(input: SaveAcademicPeriodInputDTO): Promise<number> {
        return await this.academicPeriodRepository.save(
            input.semester,
            input.period_type,
            input.start_date,
            input.end_date
        );
    }
}
