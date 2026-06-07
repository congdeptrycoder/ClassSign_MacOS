import { ISemesterRepository } from '../../domain/repositories/ISemesterRepository';
import { Semester } from '../../domain/entities/Semester';

export class SemesterRepositoryImpl implements ISemesterRepository {
    async getAll(): Promise<Semester[]> {
        try {
            const response = await fetch('http://localhost:3002/api/semesters');
            if (!response.ok) {
                throw new Error('Không thể tải danh sách kỳ học.');
            }
            const data = await response.json();
            return data.map((item: any) => new Semester(item.id, item.semester, item.is_active));
        } catch (error: any) {
            console.error('SemesterRepositoryImpl getAll error:', error);
            throw new Error(error.message || 'Lỗi kết nối tới máy chủ.');
        }
    }
}
