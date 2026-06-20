import { IAdminRepository } from '../../domain/repositories/IAdminRepository';
import { CourseRegistrationStat } from '../../domain/entities/CourseRegistrationStat';
import { apiClient } from '../api/apiClient';

export class AdminRepositoryImpl implements IAdminRepository {
    async getCourseRegistrationStats(semester: number): Promise<CourseRegistrationStat[]> {
        try {
            const data = await apiClient.get<any[]>(`/admin/course-registration-stats?semester=${semester}`);
            return data.map(item => new CourseRegistrationStat(
                item.course_id,
                item.ma_hp,
                item.ten_hp,
                item.truong_khoa,
                item.so_luong_dang_ky,
                item.so_luong_lop,
                item.so_luong_dk_toi_da
            ));
        } catch (error: any) {
            console.error('AdminRepositoryImpl getCourseRegistrationStats error:', error);
            throw new Error(error.message || 'Lỗi kết nối tới máy chủ.');
        }
    }
}
