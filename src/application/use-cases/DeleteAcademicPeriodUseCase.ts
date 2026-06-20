import { IAcademicPeriodRepository } from '../../domain/repositories/IAcademicPeriodRepository';

export class DeleteAcademicPeriodUseCase {
    constructor(private academicPeriodRepository: IAcademicPeriodRepository) {}

    async execute(id: number): Promise<void> {
        if (!id || id <= 0) {
            throw new Error('ID giai đoạn đăng ký không hợp lệ.');
        }
        await this.academicPeriodRepository.delete(id);
    }
}
