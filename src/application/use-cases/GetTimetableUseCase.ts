import { ITimetableRepository } from '../../domain/repositories/ITimetableRepository';

export class GetTimetableUseCase {
    constructor(private readonly repository: ITimetableRepository) {}

    execute(studentId: number, semesterId?: string) {
        if (!studentId || studentId <= 0) {
            throw new Error('Student ID không hợp lệ.');
        }
        
        if (semesterId !== undefined) {
            return this.repository.getTimetable(studentId, semesterId);
        }
        return this.repository.getTimetable(studentId);
    }
}
