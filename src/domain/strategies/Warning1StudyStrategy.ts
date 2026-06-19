import { IStudentStatusStrategy } from './IStudentStatusStrategy';

export class Warning1StudyStrategy implements IStudentStatusStrategy {
    getMaxAllowedCredits(): number {
        return 20;
    }

    getRegistrationStatusNote(): string {
        return 'Bạn đang bị cảnh cáo mức 1. Chỉ được đăng ký tối đa 20 TC';
    }
}
