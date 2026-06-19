export interface IStudentStatusStrategy {
    getMaxAllowedCredits(): number;
    getRegistrationStatusNote(): string;
}

export class NormalStudyStrategy implements IStudentStatusStrategy {
    getMaxAllowedCredits(): number { return 24; }
    getRegistrationStatusNote(): string { return 'Bạn được đăng ký tối đa 24 TC'; }
}

export class Warning1StudyStrategy implements IStudentStatusStrategy {
    getMaxAllowedCredits(): number { return 20; }
    getRegistrationStatusNote(): string { return 'Bạn đang bị cảnh cáo mức 1. Chỉ được đăng ký tối đa 20 TC'; }
}

export class Warning2StudyStrategy implements IStudentStatusStrategy {
    getMaxAllowedCredits(): number { return 16; }
    getRegistrationStatusNote(): string { return 'Bạn đang bị cảnh cáo mức 2. Chỉ được đăng ký tối đa 16 TC'; }
}

export class Warning3StudyStrategy implements IStudentStatusStrategy {
    getMaxAllowedCredits(): number { return 12; }
    getRegistrationStatusNote(): string { return 'Bạn đang bị cảnh cáo mức 3. Chỉ được đăng ký tối đa 12 TC'; }
}

export class StudentStatusStrategyFactory {
    private static strategies: Map<string, IStudentStatusStrategy> = new Map([
        ['study_cc1', new Warning1StudyStrategy()],
        ['study_cc2', new Warning2StudyStrategy()],
        ['study_cc3', new Warning3StudyStrategy()],
        ['study', new NormalStudyStrategy()],
    ]);

    static registerStrategy(status: string, strategy: IStudentStatusStrategy) {
        this.strategies.set(status, strategy);
    }

    static getStrategy(status: string): IStudentStatusStrategy {
        return this.strategies.get(status) || new NormalStudyStrategy();
    }
}
