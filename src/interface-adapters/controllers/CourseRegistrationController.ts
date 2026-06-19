import { GetRegisteredCoursesUseCase } from '../../application/use-cases/GetRegisteredCoursesUseCase';
import { SearchCourseSuggestionsUseCase } from '../../application/use-cases/SearchCourseSuggestionsUseCase';
import { RegisterCourseUseCase } from '../../application/use-cases/RegisterCourseUseCase';
import { CancelCourseRegistrationUseCase } from '../../application/use-cases/CancelCourseRegistrationUseCase';

export class CourseRegistrationController {
  constructor(
    private getRegisteredCoursesUseCase: GetRegisteredCoursesUseCase,
    private searchCourseSuggestionsUseCase: SearchCourseSuggestionsUseCase,
    private registerCourseUseCase: RegisterCourseUseCase,
    private cancelCourseRegistrationUseCase: CancelCourseRegistrationUseCase
  ) {}

  async getRegisteredCourses(studentId: number) {
    return this.getRegisteredCoursesUseCase.execute(studentId);
  }

  async searchCourseSuggestions(studentId: number, query: string) {
    return this.searchCourseSuggestionsUseCase.execute(studentId, query);
  }

  async registerCourse(studentId: number, courseId: number) {
    return this.registerCourseUseCase.execute(studentId, courseId);
  }

  async cancelCourseRegistration(studentId: number, courseId: number) {
    return this.cancelCourseRegistrationUseCase.execute(studentId, courseId);
  }
}
