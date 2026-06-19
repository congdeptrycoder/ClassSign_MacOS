import {
  Curriculum,
  CurriculumCourse,
  RegisteredCourse,
} from '../../domain/entities/StudentRegistration';
import { ICourseRegistrationRepository } from '../../domain/repositories/ICourseRegistrationRepository';
import { apiClient } from '../api/apiClient';

export class StudentCourseRegistrationRepositoryImpl implements ICourseRegistrationRepository {
  getCurriculum(studentId: number): Promise<Curriculum> {
    return apiClient.get<Curriculum>(`/students/${studentId}/curriculum`);
  }

  getRegisteredCourses(studentId: number): Promise<RegisteredCourse[]> {
    return apiClient.get<RegisteredCourse[]>(
      `/students/${studentId}/registered-courses`
    );
  }

  searchCourseSuggestions(
    studentId: number,
    query: string
  ): Promise<CurriculumCourse[]> {
    return apiClient.get<CurriculumCourse[]>(
      `/students/${studentId}/course-suggestions?q=${encodeURIComponent(query)}`
    );
  }

  registerCourse(studentId: number, courseId: number): Promise<{ course: RegisteredCourse; message: string }> {
    return apiClient.post<{ course: RegisteredCourse; message: string }>(
      `/students/${studentId}/course-registrations`,
      { courseId }
    );
  }

  cancelCourseRegistration(studentId: number, courseId: number): Promise<void> {
    return apiClient.delete<void>(`/students/${studentId}/course-registrations/${courseId}`);
  }
}
