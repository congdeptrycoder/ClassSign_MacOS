import {
  ClassSuggestion,
  Curriculum,
  CurriculumCourse,
  RegisteredCourse,
  TimetableEntry,
} from '../../domain/entities/StudentRegistration';
import { IStudentRegistrationRepository } from '../../domain/repositories/IStudentRegistrationRepository';
import { apiClient } from '../api/apiClient';

export class StudentRegistrationRepositoryImpl
  implements IStudentRegistrationRepository
{
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

  registerCourse(studentId: number, courseId: number): Promise<RegisteredCourse> {
    return apiClient.post<RegisteredCourse>(
      `/students/${studentId}/course-registrations`,
      { courseId }
    );
  }

  searchClassSuggestions(
    studentId: number,
    query: string
  ): Promise<ClassSuggestion[]> {
    return apiClient.get<ClassSuggestion[]>(
      `/students/${studentId}/class-suggestions?q=${encodeURIComponent(query)}`
    );
  }

  async registerClass(studentId: number, classId: number): Promise<void> {
    await apiClient.post<{ id: number }>(`/students/${studentId}/class-registrations`, {
      classId,
    });
  }

  getTimetable(studentId: number): Promise<TimetableEntry[]> {
    return apiClient.get<TimetableEntry[]>(`/students/${studentId}/timetable`);
  }
}
