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

  registerCourse(studentId: number, courseId: number): Promise<{ course: RegisteredCourse; message: string }> {
    return apiClient.post<{ course: RegisteredCourse; message: string }>(
      `/students/${studentId}/course-registrations`,
      { courseId }
    );
  }

  cancelCourseRegistration(studentId: number, courseId: number): Promise<void> {
    return apiClient.delete<void>(`/students/${studentId}/course-registrations/${courseId}`);
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

  cancelClassRegistration(studentId: number, classId: number): Promise<void> {
    return apiClient.delete<void>(`/students/${studentId}/class-registrations/${classId}`);
  }


  getClassesForCourse(studentId: number, courseId: number): Promise<ClassSuggestion[]> {
    return apiClient.get<ClassSuggestion[]>(
      `/students/${studentId}/courses/${courseId}/classes`
    );
  }

  getTimetable(studentId: number): Promise<TimetableEntry[]> {
    return apiClient.get<TimetableEntry[]>(`/students/${studentId}/timetable`);
  }
}
