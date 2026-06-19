import { IStudentStatusStrategy } from './IStudentStatusStrategy';

export class NormalStudyStrategy implements IStudentStatusStrategy {
    getMaxAllowedCredits(): number {
        return 24;
    }

    getRegistrationStatusNote(): string {
        return 'Bạn được đăng ký tối đa 24 TC';
    }
}
