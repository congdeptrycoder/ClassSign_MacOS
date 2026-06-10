import { useState, useEffect } from 'react';
import { CourseRegistrationStat } from '../../../domain/entities/CourseRegistrationStat';
import { AdminRepositoryImpl } from '../../../infrastructure/repositories/AdminRepositoryImpl';
import { GetCourseRegistrationStatsUseCase } from '../../../application/use-cases/GetCourseRegistrationStatsUseCase';
import { AdminController } from '../../controllers/AdminController';

export const useAdminCourseRegistrationDetailsViewModel = (semester: number | null) => {
    const [stats, setStats] = useState<CourseRegistrationStat[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [filterMaHp, setFilterMaHp] = useState('');
    const [filterTenHp, setFilterTenHp] = useState('');
    const [filterTruongKhoa, setFilterTruongKhoa] = useState('');
    const [filterSoLuong, setFilterSoLuong] = useState('');

    useEffect(() => {
        if (!semester) return;

        const loadStats = async () => {
            setLoading(true);
            setError(null);
            try {
                const adminRepo = new AdminRepositoryImpl();
                const useCase = new GetCourseRegistrationStatsUseCase(adminRepo);
                const controller = new AdminController(useCase);

                const data = await controller.getCourseRegistrationStats(semester);
                setStats(data);
            } catch (err: any) {
                setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu thống kê');
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, [semester]);

    const filteredStats = stats.filter(stat => {
        return (
            stat.ma_hp.toLowerCase().includes(filterMaHp.toLowerCase()) &&
            stat.ten_hp.toLowerCase().includes(filterTenHp.toLowerCase()) &&
            (stat.truong_khoa || '').toLowerCase().includes(filterTruongKhoa.toLowerCase()) &&
            stat.so_luong_dang_ky.toString().includes(filterSoLuong)
        );
    });

    return {
        stats: filteredStats,
        loading,
        error,
        filterMaHp,
        setFilterMaHp,
        filterTenHp,
        setFilterTenHp,
        filterTruongKhoa,
        setFilterTruongKhoa,
        filterSoLuong,
        setFilterSoLuong
    };
};
