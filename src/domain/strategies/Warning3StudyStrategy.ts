import { IStudentStatusStrategy } from './IStudentStatusStrategy';

export class Warning3StudyStrategy implements IStudentStatusStrategy {
    getMaxAllowedCredits(): number {
        return 12;
    }

    getRegistrationStatusNote(): string {
        return 'Bạn đang bị cảnh cáo mức 3. Chỉ được đăng ký tối đa 12 TC';
    }
}
