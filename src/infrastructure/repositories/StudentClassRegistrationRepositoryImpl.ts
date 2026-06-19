import {
  ClassSuggestion,
} from '../../domain/entities/StudentRegistration';
import { IClassRegistrationRepository } from '../../domain/repositories/IClassRegistrationRepository';
import { apiClient } from '../api/apiClient';

export class StudentClassRegistrationRepositoryImpl implements IClassRegistrationRepository {
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
}
