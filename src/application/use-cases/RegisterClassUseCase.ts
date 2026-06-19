import { IClassRegistrationRepository } from '../../domain/repositories/IClassRegistrationRepository';

export class RegisterClassUseCase {
    constructor(private readonly repository: IClassRegistrationRepository) {}

    execute(studentId: number, classId: number) {
        return this.repository.registerClass(studentId, classId);
    }
}
