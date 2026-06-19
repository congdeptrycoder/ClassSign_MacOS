import { StudentStatusStrategyFactory } from '../strategies/IStudentStatusStrategy';

export class Account {
    id: number;
    username: string;
    name: string;
    role: string;
    id_card: string;
    status: string;

    constructor(
        id: number,
        username: string,
        name: string,
        role: string,
        id_card: string,
        status: string = 'study'
    ) {
        this.id = id;
        this.username = username;
        this.name = name;
        this.role = role;
        this.id_card = id_card;
        this.status = status;
    }

    getMaxAllowedCredits(): number {
        return StudentStatusStrategyFactory.getStrategy(this.status).getMaxAllowedCredits();
    }

    getRegistrationStatusNote(): string {
        return StudentStatusStrategyFactory.getStrategy(this.status).getRegistrationStatusNote();
    }
}
