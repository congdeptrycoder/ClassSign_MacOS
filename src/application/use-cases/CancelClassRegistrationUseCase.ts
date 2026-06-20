import { IClassRegistrationRepository } from '../../domain/repositories/IClassRegistrationRepository';

export class CancelClassRegistrationUseCase {
    constructor(private readonly repository: IClassRegistrationRepository) {}

    execute(studentId: number, classId: number) {
        if (!studentId || studentId <= 0) {
            throw new Error('Student ID không hợp lệ.');
        }
        if (!classId || classId <= 0) {
            throw new Error('Class ID không hợp lệ.');
        }
        return this.repository.cancelClassRegistration(studentId, classId);
    }
}
