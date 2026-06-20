import {
  ClassSuggestion,
} from '../../domain/entities/StudentRegistration';
import { IClassRegistrationRepository } from '../../domain/repositories/IClassRegistrationRepository';
import { apiClient } from '../api/apiClient';
import { Logger } from '../../shared/utils/logger';

export class StudentClassRegistrationRepositoryImpl implements IClassRegistrationRepository {
  async searchClassSuggestions(
    studentId: number,
    query: string
  ): Promise<ClassSuggestion[]> {
    try {
      return await apiClient.get<ClassSuggestion[]>(
        `/students/${studentId}/class-suggestions?q=${encodeURIComponent(query)}`
      );
    } catch (error: any) {
      Logger.error('StudentClassRegistrationRepositoryImpl searchClassSuggestions error: ' + (error.message || ''));
      throw new Error(error.message || 'Lỗi hệ thống khi tìm kiếm gợi ý lớp.');
    }
  }

  async registerClass(studentId: number, classId: number): Promise<void> {
    try {
      await apiClient.post<{ id: number }>(`/students/${studentId}/class-registrations`, {
        classId,
      });
    } catch (error: any) {
      Logger.error('StudentClassRegistrationRepositoryImpl registerClass error: ' + (error.message || ''));
      throw new Error(error.message || 'Lỗi hệ thống khi đăng ký lớp.');
    }
  }

  async cancelClassRegistration(studentId: number, classId: number): Promise<void> {
    try {
      return await apiClient.delete<void>(`/students/${studentId}/class-registrations/${classId}`);
    } catch (error: any) {
      Logger.error('StudentClassRegistrationRepositoryImpl cancelClassRegistration error: ' + (error.message || ''));
      throw new Error(error.message || 'Lỗi hệ thống khi hủy đăng ký lớp.');
    }
  }

  async getClassesForCourse(studentId: number, courseId: number): Promise<ClassSuggestion[]> {
    try {
      return await apiClient.get<ClassSuggestion[]>(
        `/students/${studentId}/courses/${courseId}/classes`
      );
    } catch (error: any) {
      Logger.error('StudentClassRegistrationRepositoryImpl getClassesForCourse error: ' + (error.message || ''));
      throw new Error(error.message || 'Lỗi hệ thống khi tải danh sách lớp của học phần.');
    }
  }
}
