import { useState, useEffect } from 'react';
import { CourseRegistrationStat } from '../../../domain/entities/CourseRegistrationStat';
import { adminController, adminClassController } from '../../../di/admin.di';

export const useAdminCourseRegistrationDetailsViewModel = (semester: number | null) => {
    const [stats, setStats] = useState<CourseRegistrationStat[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [filterMaHp, setFilterMaHp] = useState('');
    const [filterTenHp, setFilterTenHp] = useState('');
    const [filterTruongKhoa, setFilterTruongKhoa] = useState('');
    const [filterSoLuong, setFilterSoLuong] = useState('');

    const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);
    const [courseClasses, setCourseClasses] = useState<Record<number, any[]>>({});
    const [loadingClasses, setLoadingClasses] = useState(false);



    useEffect(() => {
        if (!semester) return;

        const loadStats = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await adminController.getCourseRegistrationStats(semester);
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

    const toggleExpandCourse = async (courseId: number, sem: number) => {
        if (expandedCourseId === courseId) {
            setExpandedCourseId(null);
            return;
        }

        setExpandedCourseId(courseId);
        if (!courseClasses[courseId]) {
            setLoadingClasses(true);
            try {
                const classes = await adminClassController.getClassesByCourse(sem, courseId);
                setCourseClasses(prev => ({ ...prev, [courseId]: classes }));
            } catch (err: any) {
                window.alert('Lỗi khi tải danh sách lớp: ' + (err.message || ''));
            } finally {
                setLoadingClasses(false);
            }
        }
    };

    const handleDeleteClass = async (classId: number, courseId: number, sem: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xoá lớp học này?')) {
            try {
                await adminClassController.deleteClassCourse(classId);
                window.alert('Xoá lớp thành công!');
                // Reload classes
                setLoadingClasses(true);
                const classes = await adminClassController.getClassesByCourse(sem, courseId);
                setCourseClasses(prev => ({ ...prev, [courseId]: classes }));
                
                // Optionally reload stats if you want, but this is fine.
            } catch (err: any) {
                window.alert('Lỗi khi xoá lớp: ' + (err.message || ''));
            } finally {
                setLoadingClasses(false);
            }
        }
    };

    const handleEditClass = (classItem: any) => {
        window.alert('Chuyển hướng: Sẽ chuyển sang màn hình sửa với thông tin tương ứng. (Tính năng đang phát triển)');
    };

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
        setFilterSoLuong,
        expandedCourseId,
        courseClasses,
        loadingClasses,
        toggleExpandCourse,
        handleDeleteClass,
        handleEditClass
    };
};
