import { IAcademicPeriodRepository } from '../../domain/repositories/IAcademicPeriodRepository';
import { AcademicPeriod } from '../../domain/entities/AcademicPeriod';
import { apiClient } from '../api/apiClient';

interface AcademicPeriodRecord {
  id: number;
  semester: number;
  semester_name: number;
  period_type: string;
  start_date: string;
  end_date: string;
  is_active: number;
}

interface CreatedAcademicPeriodResponse {
  id: number;
}

export class AcademicPeriodRepositoryImpl implements IAcademicPeriodRepository {
  async getAll(): Promise<AcademicPeriod[]> {
    try {
      const data = await apiClient.get<AcademicPeriodRecord[]>('/academic-periods');
      return data.map(
        item =>
          new AcademicPeriod(
            item.id,
            item.semester,
            item.semester_name,
            item.period_type,
            item.start_date,
            item.end_date,
            item.is_active
          )
      );
    } catch (error: any) {
      console.error('AcademicPeriodRepositoryImpl getAll error:', error);
      throw new Error(error.message || 'Lỗi kết nối tới máy chủ.');
    }
  }

  async save(
    semester: number,
    period_type: string,
    start_date: string,
    end_date: string,
    id?: number
  ): Promise<number> {
    try {
      if (id) {
        await apiClient.put<null>(
          `/academic-periods/${id}`,
          { semester, period_type, start_date, end_date }
        );
        return id;
      } else {
        const data = await apiClient.post<CreatedAcademicPeriodResponse>(
          '/academic-periods',
          { semester, period_type, start_date, end_date }
        );
        return data.id;
      }
    } catch (error: any) {
      console.error('AcademicPeriodRepositoryImpl save error:', error);
      throw new Error(error.message || 'Lỗi kết nối tới máy chủ.');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete<null>(`/academic-periods/${id}`);
    } catch (error: any) {
      console.error('AcademicPeriodRepositoryImpl delete error:', error);
      throw new Error(error.message || 'Lỗi kết nối tới máy chủ.');
    }
  }
}
