import {
  ClassSuggestion,
  Curriculum,
  CurriculumCourse,
  RegisteredCourse,
  TimetableEntry,
} from '../entities/StudentRegistration';

export interface IStudentRegistrationRepository {
  getCurriculum(studentId: number): Promise<Curriculum>;
  getRegisteredCourses(studentId: number): Promise<RegisteredCourse[]>;
  searchCourseSuggestions(studentId: number, query: string): Promise<CurriculumCourse[]>;
  registerCourse(studentId: number, courseId: number): Promise<RegisteredCourse>;
  searchClassSuggestions(studentId: number, query: string): Promise<ClassSuggestion[]>;
  registerClass(studentId: number, classId: number): Promise<void>;
  getTimetable(studentId: number): Promise<TimetableEntry[]>;
}
