import { IClassRegistrationRepository } from '../../domain/repositories/IClassRegistrationRepository';

export class CancelClassRegistrationUseCase {
    constructor(private readonly repository: IClassRegistrationRepository) {}

    execute(studentId: number, classId: number) {
        return this.repository.cancelClassRegistration(studentId, classId);
    }
}
