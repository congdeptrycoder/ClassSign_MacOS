import {
  TimetableEntry,
} from '../../domain/entities/StudentRegistration';
import { ITimetableRepository } from '../../domain/repositories/ITimetableRepository';
import { apiClient } from '../api/apiClient';
import { Logger } from '../../shared/utils/logger';

export class StudentTimetableRepositoryImpl implements ITimetableRepository {
  async getTimetable(studentId: number, semesterId?: string): Promise<TimetableEntry[]> {
    try {
      const query = semesterId ? `?semesterId=${semesterId}` : '';
      return await apiClient.get<TimetableEntry[]>(`/students/${studentId}/timetable${query}`);
    } catch (error: any) {
      Logger.error('StudentTimetableRepositoryImpl getTimetable error: ' + (error.message || ''));
      throw new Error(error.message || 'Lỗi hệ thống khi tải thời khóa biểu.');
    }
  }
}
