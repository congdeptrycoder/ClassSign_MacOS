import { IAcademicPeriodRepository } from '../../domain/repositories/IAcademicPeriodRepository';

export class DeleteAcademicPeriodUseCase {
    constructor(private academicPeriodRepository: IAcademicPeriodRepository) {}

    async execute(id: number): Promise<void> {
        await this.academicPeriodRepository.delete(id);
    }
}
