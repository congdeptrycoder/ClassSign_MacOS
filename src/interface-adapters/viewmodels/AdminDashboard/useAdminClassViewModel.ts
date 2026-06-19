import { useState, useEffect } from 'react';
import { filterTableByColumn } from '../../../shared/utils/FilterTableByColumn';
import { adminClassController } from '../../../di/admin.di';

export interface ClassInfo {
    ky: string;
    khoa_truong: string;
    ma_lop: string;
    ma_lop_kem: string;
    ma_hp: string;
    ten_hp: string;
    khoi_luong: string;
    ghi_chu: string;
    thu: string;
    tiet_bd: string;
    tiet_kt: string;
    buoi: string;
    phong_hoc: string;
    can_tn: string;
    sl_dk: string;
    sl_max: string;
    trang_thai: string;
    teaching_type: string;
}

export const useAdminClassViewModel = (
    onNavigateToEdit?: (item: ClassInfo) => void,
) => {
    const [filters, setFilters] = useState<Partial<Record<keyof ClassInfo, string>>>({});
    const [classesData, setClassesData] = useState<ClassInfo[]>([]);
    const [selectedClassSemesterId, setSelectedClassSemesterId] = useState<number | ''>('');

    const handleFilterChange = (key: keyof ClassInfo, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const filteredClassesData = filterTableByColumn(classesData, filters);

    const handleEdit = (item: ClassInfo) => {
        if (onNavigateToEdit) {
            onNavigateToEdit(item);
            return;
        }

        window.alert('Chuyển hướng: Sẽ chuyển sang màn hình sửa với thông tin tương ứng.');
    };

    const handleDelete = async (item: ClassInfo) => {
        if (window.confirm(`Xác nhận xoá: Bạn có chắc chắn muốn xoá lớp ${item.ma_lop}?`)) {
            try {
                const classId = (item as any).id;
                if (!classId) {
                    window.alert("Lỗi: Không tìm thấy ID của lớp học");
                    return;
                }

                await adminClassController.deleteClassCourse(classId);

                setClassesData(currentItems =>
                    currentItems.filter(classItem => classItem.ma_lop !== item.ma_lop),
                );
            } catch (error: any) {
                window.alert('Xoá lớp học thất bại: ' + (error.message || ''));
            }
        }
    };

    const loadClassesData = async (semesterId: number) => {
        try {
            const data = await adminClassController.getAllClassesBySemester(semesterId);

            const mappedData: ClassInfo[] = data.map((d: any) => ({
                id: d.id,
                ky: d.ky || semesterId.toString(),
                khoa_truong: d.khoa_truong || '',
                ma_lop: d.ma_lop || '',
                ma_lop_kem: d.ma_lop_kem !== 'NULL' ? d.ma_lop_kem : '',
                ma_hp: d.ma_hp || '',
                ten_hp: d.ten_hp || '',
                khoi_luong: d.khoi_luong || '',
                ghi_chu: d.ghi_chu !== 'NULL' ? d.ghi_chu : '',
                thu: d.thu || '',
                tiet_bd: d.tiet_bd || '',
                tiet_kt: d.tiet_kt || '',
                buoi: d.buoi || '',
                phong_hoc: d.phong_hoc || '',
                can_tn: d.can_tn !== 'NULL' ? d.can_tn : '',
                sl_dk: d.sl_dk?.toString() || '0',
                sl_max: d.sl_max?.toString() || '0',
                trang_thai: (d.sl_dk >= d.sl_max && d.sl_max > 0) ? 'Đã đầy' : 'Mở ĐK',
                teaching_type: d.teaching_type !== 'NULL' ? d.teaching_type : '',
            } as any));

            setClassesData(mappedData);
        } catch (error) {
            console.error("Failed to load classes data", error);
            setClassesData([]);
        }
    };

    useEffect(() => {
        if (selectedClassSemesterId !== '') {
            loadClassesData(selectedClassSemesterId as number);
        }
    }, [selectedClassSemesterId]);

    return {
        filters,
        handleFilterChange,
        classesData,
        filteredClassesData,
        handleEdit,
        handleDelete,
        selectedClassSemesterId,
        setSelectedClassSemesterId,
    };
};
