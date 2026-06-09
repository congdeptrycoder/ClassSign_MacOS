import { ISemesterRepository } from '../../domain/repositories/ISemesterRepository';
import { Semester } from '../../domain/entities/Semester';
import { apiClient } from '../api/apiClient';

interface SemesterRecord {
  id: number;
  semester: number;
  is_active: number;
}

export class SemesterRepositoryImpl implements ISemesterRepository {
  async getAll(): Promise<Semester[]> {
    try {
      const data = await apiClient.get<SemesterRecord[]>('/semesters');
      return data.map(
        item => new Semester(item.id, item.semester, item.is_active)
      );
    } catch (error: any) {
      console.error('SemesterRepositoryImpl getAll error:', error);
      throw new Error(error.message || 'Lỗi kết nối tới máy chủ.');
    }
  }
}
