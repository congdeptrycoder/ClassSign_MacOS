import {
  Curriculum,
  CurriculumCourse,
  RegisteredCourse,
} from '../entities/StudentRegistration';

export interface ICourseRegistrationRepository {
  getCurriculum(studentId: number): Promise<Curriculum>;
  getRegisteredCourses(studentId: number): Promise<RegisteredCourse[]>;
  searchCourseSuggestions(studentId: number, query: string): Promise<CurriculumCourse[]>;
  registerCourse(studentId: number, courseId: number): Promise<{ course: RegisteredCourse; message: string }>;
  cancelCourseRegistration(studentId: number, courseId: number): Promise<void>;
}
