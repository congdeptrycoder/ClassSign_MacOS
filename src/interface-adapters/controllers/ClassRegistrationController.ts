import { SearchClassSuggestionsUseCase } from '../../application/use-cases/SearchClassSuggestionsUseCase';
import { RegisterClassUseCase } from '../../application/use-cases/RegisterClassUseCase';
import { CancelClassRegistrationUseCase } from '../../application/use-cases/CancelClassRegistrationUseCase';
import { GetClassesForCourseUseCase } from '../../application/use-cases/GetClassesForCourseUseCase';

export class ClassRegistrationController {
  constructor(
    private searchClassSuggestionsUseCase: SearchClassSuggestionsUseCase,
    private registerClassUseCase: RegisterClassUseCase,
    private cancelClassRegistrationUseCase: CancelClassRegistrationUseCase,
    private getClassesForCourseUseCase: GetClassesForCourseUseCase
  ) {}

  async searchClassSuggestions(studentId: number, query: string) {
    return this.searchClassSuggestionsUseCase.execute(studentId, query);
  }

  async registerClass(studentId: number, classId: number) {
    return this.registerClassUseCase.execute(studentId, classId);
  }

  async cancelClassRegistration(studentId: number, classId: number) {
    return this.cancelClassRegistrationUseCase.execute(studentId, classId);
  }

  async getClassesForCourse(studentId: number, courseId: number) {
    return this.getClassesForCourseUseCase.execute(studentId, courseId);
  }
}
