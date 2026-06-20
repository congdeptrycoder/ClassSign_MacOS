import { IClassRegistrationRepository } from '../../domain/repositories/IClassRegistrationRepository';

export class SearchClassSuggestionsUseCase {
    constructor(private readonly repository: IClassRegistrationRepository) {}

    execute(studentId: number, query: string) {
        if (!studentId || studentId <= 0) {
            throw new Error('Student ID không hợp lệ.');
        }
        if (!query.trim()) {
            return Promise.resolve([]);
        }
        return this.repository.searchClassSuggestions(studentId, query.trim());
    }
}
