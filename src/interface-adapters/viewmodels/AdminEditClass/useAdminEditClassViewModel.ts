import { useState } from 'react';
import { ClassInfo } from '../AdminDashboard/useAdminDashboardViewModel';

type ClassFormValues = Record<keyof ClassInfo, string>;

const createInitialValues = (initialData?: Partial<ClassInfo>): ClassFormValues => ({
    ky: initialData?.ky ?? '',
    khoa_truong: initialData?.khoa_truong ?? '',
    ma_lop: initialData?.ma_lop ?? '',
    ma_lop_kem: initialData?.ma_lop_kem ?? '',
    ma_hp: initialData?.ma_hp ?? '',
    ten_hp: initialData?.ten_hp ?? '',
    khoi_luong: initialData?.khoi_luong ?? '',
    ghi_chu: initialData?.ghi_chu ?? '',
    tiet_bd: initialData?.tiet_bd ?? '',
    tiet_kt: initialData?.tiet_kt ?? '',
    buoi: initialData?.buoi ?? '',
    phong_hoc: initialData?.phong_hoc ?? '',
    can_tn: initialData?.can_tn ?? '',
    sl_dk: initialData?.sl_dk ?? '',
    sl_max: initialData?.sl_max ?? '',
    trang_thai: initialData?.trang_thai ?? '',
    teaching_type: initialData?.teaching_type ?? '',
});

export const useAdminEditClassViewModel = (
    onGoBack?: () => void,
    initialData?: Partial<ClassInfo>,
) => {
    const [formValues, setFormValues] = useState<ClassFormValues>(
        createInitialValues(initialData),
    );

    const handleInputChange = (key: keyof ClassFormValues, value: string) => {
        setFormValues(currentValues => ({
            ...currentValues,
            [key]: value,
        }));
    };

    const handleSave = () => {
        window.alert('Thành công: Đã lưu thông tin lớp học!');
    };

    const handleGoBack = () => {
        if (onGoBack) {
            onGoBack();
            return;
        }

        window.alert('Quay lại: Sẽ quay lại màn hình chính');
    };

    return {
        formValues,
        handleInputChange,
        handleSave,
        handleGoBack,
    };
};
