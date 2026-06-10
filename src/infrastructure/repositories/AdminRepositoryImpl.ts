import { IAdminRepository } from '../../domain/repositories/IAdminRepository';
import { CourseRegistrationStat } from '../../domain/entities/CourseRegistrationStat';
import { apiClient } from '../api/apiClient';

export class AdminRepositoryImpl implements IAdminRepository {
    async getCourseRegistrationStats(semester: number): Promise<CourseRegistrationStat[]> {
        try {
            const data = await apiClient.get<CourseRegistrationStat[]>(`/admin/course-registration-stats?semester=${semester}`);
            return data.map(item => new CourseRegistrationStat(
                item.ma_hp,
                item.ten_hp,
                item.truong_khoa,
                item.so_luong_dang_ky
            ));
        } catch (error: any) {
            console.error('AdminRepositoryImpl getCourseRegistrationStats error:', error);
            throw new Error(error.message || 'Lỗi kết nối tới máy chủ.');
        }
    }
}
