export interface IStudentStatusStrategy {
    getMaxAllowedCredits(): number;
    getRegistrationStatusNote(): string;
}
