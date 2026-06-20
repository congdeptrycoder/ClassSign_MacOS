import { useState } from 'react';
import { adminClassController } from '../../../di/admin.di';
import { SaveClassCourseInputDTO } from '../../entities/ClassCourse';

export interface AdminCreateClassState {
    id?: number;
    semester: string | number;
    departmentName: string;
    courseCode: string;
    courseName: string;
    classCode: string;
    subClassCode: string;
    notes: string;
    dayOfWeek: string;
    startPeriod: string;
    endPeriod: string;
    daySession: string;
    room: string;
    requiresExperiment: string;
    maxSlots: string;
    teachingType: string;
}

export const useAdminCreateClassViewModel = (
    initialState: Partial<AdminCreateClassState>,
    onNavigateBack: () => void,
    isEdit: boolean = false
) => {
    const [formData, setFormData] = useState<AdminCreateClassState>({
        id: initialState.id,
        semester: initialState.semester || '',
        departmentName: initialState.departmentName || '',
        courseCode: initialState.courseCode || '',
        courseName: initialState.courseName || '',
        classCode: initialState.classCode || '',
        subClassCode: initialState.subClassCode || '',
        notes: initialState.notes || '',
        dayOfWeek: initialState.dayOfWeek || '',
        startPeriod: initialState.startPeriod || '',
        endPeriod: initialState.endPeriod || '',
        daySession: initialState.daySession || 'Sáng',
        room: initialState.room || '',
        requiresExperiment: initialState.requiresExperiment || '',
        maxSlots: initialState.maxSlots || '',
        teachingType: initialState.teachingType || '',
    });

    const handleChange = (key: keyof AdminCreateClassState, value: string) => {
        setFormData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async () => {
        if (!formData.classCode || !formData.dayOfWeek || !formData.startPeriod || !formData.endPeriod || !formData.daySession || !formData.room || !formData.maxSlots) {
            window.alert('Vui lòng điền đầy đủ các thông tin bắt buộc (có dấu *)');
            return;
        }

        const payload: SaveClassCourseInputDTO = {
            ...formData,
            subClassCode: formData.subClassCode || 'NULL',
            notes: formData.notes || 'NULL',
            requiresExperiment: formData.requiresExperiment || 'NULL',
            teachingType: formData.teachingType || 'NULL',
        };

        try {
            if (isEdit) {
                if (!formData.id) {
                    window.alert('Lỗi: Không tìm thấy ID lớp học để cập nhật');
                    return;
                }
                
                await adminClassController.updateClassCourse(formData.id, payload);
                window.alert('Thành công: Đã cập nhật thông tin lớp học!');
                onNavigateBack();
            } else {
                await adminClassController.createClassCourse(payload);
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
