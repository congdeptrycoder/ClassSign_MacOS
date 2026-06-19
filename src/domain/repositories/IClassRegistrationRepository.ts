import {
  ClassSuggestion,
} from '../entities/StudentRegistration';

export interface IClassRegistrationRepository {
  searchClassSuggestions(studentId: number, query: string): Promise<ClassSuggestion[]>;
  registerClass(studentId: number, classId: number): Promise<void>;
  cancelClassRegistration(studentId: number, classId: number): Promise<void>;
  getClassesForCourse(studentId: number, courseId: number): Promise<ClassSuggestion[]>;
}
