import { IStudentStatusStrategy } from './IStudentStatusStrategy';

export class Warning2StudyStrategy implements IStudentStatusStrategy {
    getMaxAllowedCredits(): number {
        return 16;
    }

    getRegistrationStatusNote(): string {
        return 'Bạn đang bị cảnh cáo mức 2. Chỉ được đăng ký tối đa 16 TC';
    }
}
