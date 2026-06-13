import { useState } from 'react';
import { AdminClassRepositoryImpl } from '../../../infrastructure/repositories/AdminClassRepositoryImpl';
import { CreateClassCourseUseCase } from '../../../application/use-cases/CreateClassCourseUseCase';
import { UpdateClassCourseUseCase } from '../../../application/use-cases/UpdateClassCourseUseCase';
import { AdminClassController } from '../../controllers/AdminClassController';

export interface AdminCreateClassState {
    id?: number;
    ky: string | number;
    truong_khoa: string;
    ma_hp: string;
    ten_hp: string;
    ma_lop: string;
    ma_lop_kem: string;
    ghi_chu: string;
    thu: string;
    tiet_bd: string;
    tiet_kt: string;
    buoi: string;
    phong_hoc: string;
    can_tn: string;
    sl_max: string;
    teaching_type: string;
}

export const useAdminCreateClassViewModel = (
    initialState: Partial<AdminCreateClassState>,
    onNavigateBack: () => void,
    isEdit: boolean = false
) => {
    const [formData, setFormData] = useState<AdminCreateClassState>({
        id: initialState.id,
        ky: initialState.ky || '',
        truong_khoa: initialState.truong_khoa || '',
        ma_hp: initialState.ma_hp || '',
        ten_hp: initialState.ten_hp || '',
        ma_lop: initialState.ma_lop || '',
        ma_lop_kem: initialState.ma_lop_kem || '',
        ghi_chu: initialState.ghi_chu || '',
        thu: initialState.thu || '',
        tiet_bd: initialState.tiet_bd || '',
        tiet_kt: initialState.tiet_kt || '',
        buoi: initialState.buoi || 'Sáng',
        phong_hoc: initialState.phong_hoc || '',
        can_tn: initialState.can_tn || '',
        sl_max: initialState.sl_max || '',
        teaching_type: initialState.teaching_type || '',
    });

    const handleChange = (key: keyof AdminCreateClassState, value: string) => {
        setFormData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async () => {
        if (!formData.ma_lop || !formData.thu || !formData.tiet_bd || !formData.tiet_kt || !formData.buoi || !formData.phong_hoc || !formData.sl_max) {
            window.alert('Vui lòng điền đầy đủ các thông tin bắt buộc (có dấu *)');
            return;
        }

        const payload = {
            ...formData,
            ma_lop_kem: formData.ma_lop_kem || 'NULL',
            ghi_chu: formData.ghi_chu || 'NULL',
            can_tn: formData.can_tn || 'NULL',
            teaching_type: formData.teaching_type || 'NULL',
        };

        try {
            if (isEdit) {
                if (!formData.id) {
                    window.alert('Lỗi: Không tìm thấy ID lớp học để cập nhật');
                    return;
                }
                const repository = new AdminClassRepositoryImpl();
                const updateUseCase = new UpdateClassCourseUseCase(repository);
                const controller = new AdminClassController(new CreateClassCourseUseCase(repository), undefined, undefined, undefined, updateUseCase);
                
                await controller.updateClassCourse(formData.id, payload);
                window.alert('Thành công: Đã cập nhật thông tin lớp học!');
                onNavigateBack();
            } else {
                const repository = new AdminClassRepositoryImpl();
                const useCase = new CreateClassCourseUseCase(repository);
                const controller = new AdminClassController(useCase);
                
                await controller.createClassCourse(payload);
                window.alert('Thành công: Đã lưu lớp học mới!');
                onNavigateBack();
            }
        } catch (error: any) {
            window.alert('Lỗi khi lưu lớp học: ' + (error.message || 'Lỗi hệ thống'));
        }
    };

    return {
        formData,
        handleChange,
        handleSave
    };
};
