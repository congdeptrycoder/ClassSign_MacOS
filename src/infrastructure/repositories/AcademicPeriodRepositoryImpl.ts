import { IAcademicPeriodRepository } from '../../domain/repositories/IAcademicPeriodRepository';
import { AcademicPeriod } from '../../domain/entities/AcademicPeriod';

export class AcademicPeriodRepositoryImpl implements IAcademicPeriodRepository {
    async getAll(): Promise<AcademicPeriod[]> {
        try {
            const response = await fetch('http://localhost:3002/api/academic-periods');
            if (!response.ok) {
                throw new Error('Không thể tải danh sách kế hoạch.');
            }
            const data = await response.json();
            return data.map((item: any) => new AcademicPeriod(
                item.id,
                item.semester,
                item.semester_name,
                item.period_type,
                item.start_date,
                item.end_date,
                item.is_active
            ));
        } catch (error: any) {
            console.error('AcademicPeriodRepositoryImpl getAll error:', error);
            throw new Error(error.message || 'Lỗi kết nối tới máy chủ.');
        }
    }

    async save(semester: number, period_type: string, start_date: string, end_date: string): Promise<number> {
        try {
            const response = await fetch('http://localhost:3002/api/academic-periods', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ semester, period_type, start_date, end_date }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Lưu kế hoạch thất bại.');
            }

            const data = await response.json();
            return data.id;
        } catch (error: any) {
            console.error('AcademicPeriodRepositoryImpl save error:', error);
            throw new Error(error.message || 'Lỗi kết nối tới máy chủ.');
        }
    }

    async delete(id: number): Promise<void> {
        try {
            const response = await fetch(`http://localhost:3002/api/academic-periods/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Xóa kế hoạch thất bại.');
            }
        } catch (error: any) {
            console.error('AcademicPeriodRepositoryImpl delete error:', error);
            throw new Error(error.message || 'Lỗi kết nối tới máy chủ.');
        }
    }
}
