import { ICourseRegistrationRepository } from '../../domain/repositories/ICourseRegistrationRepository';

export class SearchCourseSuggestionsUseCase {
    constructor(private readonly repository: ICourseRegistrationRepository) {}

    execute(studentId: number, query: string) {
        if (!studentId || studentId <= 0) {
            throw new Error('Student ID không hợp lệ.');
        }
        if (!query.trim()) {
            return Promise.resolve([]);
        }
        return this.repository.searchCourseSuggestions(studentId, query.trim());
    }
}
