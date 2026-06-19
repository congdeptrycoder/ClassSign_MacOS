import { ITimetableRepository } from '../../domain/repositories/ITimetableRepository';

export class GetTimetableUseCase {
    constructor(private readonly repository: ITimetableRepository) {}

    execute(studentId: number, semesterId?: string) {
        return this.repository.getTimetable(studentId, semesterId);
    }
}
