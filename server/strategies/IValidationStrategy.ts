export interface IValidationStrategy<T> {
    validate(contextData: T): Promise<void>;
}

export class ValidationContext<T> {
    private strategies: IValidationStrategy<T>[] = [];

    addStrategy(strategy: IValidationStrategy<T>) {
        this.strategies.push(strategy);
    }

    async validateAll(contextData: T): Promise<void> {
        for (const strategy of this.strategies) {
            await strategy.validate(contextData);
        }
    }
}
