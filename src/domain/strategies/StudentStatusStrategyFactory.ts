import { IStudentStatusStrategy } from './IStudentStatusStrategy';
import { NormalStudyStrategy } from './NormalStudyStrategy';
import { Warning1StudyStrategy } from './Warning1StudyStrategy';
import { Warning2StudyStrategy } from './Warning2StudyStrategy';
import { Warning3StudyStrategy } from './Warning3StudyStrategy';

export class StudentStatusStrategyFactory {
    private static strategies: Map<string, IStudentStatusStrategy> = new Map([
        ['study', new NormalStudyStrategy()],
        ['study_cc1', new Warning1StudyStrategy()],
        ['study_cc2', new Warning2StudyStrategy()],
        ['study_cc3', new Warning3StudyStrategy()],
    ]);

    static registerStrategy(status: string, strategy: IStudentStatusStrategy): void {
        this.strategies.set(status, strategy);
    }

    static getStrategy(status: string): IStudentStatusStrategy {
        return this.strategies.get(status) || new NormalStudyStrategy();
    }
}
