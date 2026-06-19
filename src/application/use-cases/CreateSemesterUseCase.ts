import { ISemesterRepository } from '../../domain/repositories/ISemesterRepository';

export class CreateSemesterUseCase {
    constructor(private semesterRepository: ISemesterRepository) {}

    async execute(semesterCode: string): Promise<void> {
        if (!semesterCode || semesterCode.trim() === '') {
            throw new Error('Mã kỳ không được để trống.');
        }
        await this.semesterRepository.createSemester(semesterCode.trim());
    }
}
