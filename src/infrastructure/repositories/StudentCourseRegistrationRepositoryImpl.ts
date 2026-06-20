import {
  Curriculum,
  CurriculumCourse,
  RegisteredCourse,
} from '../../domain/entities/StudentRegistration';
import { ICourseRegistrationRepository } from '../../domain/repositories/ICourseRegistrationRepository';
import { apiClient } from '../api/apiClient';
import { Logger } from '../../shared/utils/logger';

export class StudentCourseRegistrationRepositoryImpl implements ICourseRegistrationRepository {
  async getCurriculum(studentId: number): Promise<Curriculum> {
    try {
      return await apiClient.get<Curriculum>(`/students/${studentId}/curriculum`);
    } catch (error: any) {
      Logger.error('StudentCourseRegistrationRepositoryImpl getCurriculum error: ' + (error.message || ''));
      throw new Error(error.message || 'Lỗi hệ thống khi tải chương trình đào tạo.');
    }
  }

  async getRegisteredCourses(studentId: number): Promise<RegisteredCourse[]> {
    try {
      return await apiClient.get<RegisteredCourse[]>(
        `/students/${studentId}/registered-courses`
      );
    } catch (error: any) {
      Logger.error('StudentCourseRegistrationRepositoryImpl getRegisteredCourses error: ' + (error.message || ''));
      throw new Error(error.message || 'Lỗi hệ thống khi tải danh sách học phần đã đăng ký.');
    }
  }

  async searchCourseSuggestions(
    studentId: number,
    query: string
  ): Promise<CurriculumCourse[]> {
    try {
      return await apiClient.get<CurriculumCourse[]>(
        `/students/${studentId}/course-suggestions?q=${encodeURIComponent(query)}`
      );
    } catch (error: any) {
      Logger.error('StudentCourseRegistrationRepositoryImpl searchCourseSuggestions error: ' + (error.message || ''));
      throw new Error(error.message || 'Lỗi hệ thống khi tìm kiếm gợi ý học phần.');
    }
  }

  async registerCourse(studentId: number, courseId: number): Promise<{ course: RegisteredCourse; message: string }> {
    try {
      return await apiClient.post<{ course: RegisteredCourse; message: string }>(
        `/students/${studentId}/course-registrations`,
        { courseId }
      );
    } catch (error: any) {
      Logger.error('StudentCourseRegistrationRepositoryImpl registerCourse error: ' + (error.message || ''));
      throw new Error(error.message || 'Lỗi hệ thống khi đăng ký học phần.');
    }
  }

  async cancelCourseRegistration(studentId: number, courseId: number): Promise<void> {
    try {
      return await apiClient.delete<void>(`/students/${studentId}/course-registrations/${courseId}`);
    } catch (error: any) {
      Logger.error('StudentCourseRegistrationRepositoryImpl cancelCourseRegistration error: ' + (error.message || ''));
      throw new Error(error.message || 'Lỗi hệ thống khi hủy đăng ký học phần.');
    }
  }
}
