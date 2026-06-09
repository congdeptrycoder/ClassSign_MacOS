import { IStudentRegistrationRepository } from '../../domain/repositories/IStudentRegistrationRepository';

export class ManageStudentRegistration {
  constructor(private readonly repository: IStudentRegistrationRepository) {}

  getCurriculum(studentId: number) {
    return this.repository.getCurriculum(studentId);
  }

  getRegisteredCourses(studentId: number) {
    return this.repository.getRegisteredCourses(studentId);
  }

  searchCourseSuggestions(studentId: number, query: string) {
    if (!query.trim()) {
      return Promise.resolve([]);
    }
    return this.repository.searchCourseSuggestions(studentId, query.trim());
  }

  registerCourse(studentId: number, courseId: number) {
    return this.repository.registerCourse(studentId, courseId);
  }

  cancelCourseRegistration(studentId: number, courseId: number) {
    return this.repository.cancelCourseRegistration(studentId, courseId);
  }

  searchClassSuggestions(studentId: number, query: string) {
    if (!query.trim()) {
      return Promise.resolve([]);
    }
    return this.repository.searchClassSuggestions(studentId, query.trim());
  }

  registerClass(studentId: number, classId: number) {
    return this.repository.registerClass(studentId, classId);
  }

  getTimetable(studentId: number) {
    return this.repository.getTimetable(studentId);
  }
}
