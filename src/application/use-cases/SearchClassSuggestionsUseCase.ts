import { IClassRegistrationRepository } from '../../domain/repositories/IClassRegistrationRepository';

export class SearchClassSuggestionsUseCase {
    constructor(private readonly repository: IClassRegistrationRepository) {}

    execute(studentId: number, query: string) {
        if (!query.trim()) {
            return Promise.resolve([]);
        }
        return this.repository.searchClassSuggestions(studentId, query.trim());
    }
}
