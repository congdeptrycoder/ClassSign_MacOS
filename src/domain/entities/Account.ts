import { StudentStatusStrategyFactory } from '../strategies/StudentStatusStrategyFactory';

export class Account {
    constructor(
        public readonly id: number,
        public readonly username: string,
        public readonly name: string,
        public readonly role: string,
        public readonly id_card: string,
        public readonly status: string = 'study'
    ) {}

    getMaxAllowedCredits(): number {
        return StudentStatusStrategyFactory.getStrategy(this.status).getMaxAllowedCredits();
    }

    getRegistrationStatusNote(): string {
        return StudentStatusStrategyFactory.getStrategy(this.status).getRegistrationStatusNote();
    }
}
