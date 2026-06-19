import { useState } from 'react';
import { academicPeriodController } from '../../../di/admin.di';
import { AcademicPeriodDTO } from '../../../application/dto/AcademicPeriodDTO';

export const useAdminPeriodViewModel = () => {
    const [regPeriodType, setRegPeriodType] = useState<'register_program' | 'register_class'>('register_program');
    const [regPeriodStart, setRegPeriodStart] = useState<string>('');
    const [regPeriodEnd, setRegPeriodEnd] = useState<string>('');
    const [selectedSemester, setSelectedSemester] = useState<number | ''>('');
    const [isEditingPeriod, setIsEditingPeriod] = useState<boolean>(false);
    const [editPeriodId, setEditPeriodId] = useState<number | null>(null);
    const [periodsData, setPeriodsData] = useState<AcademicPeriodDTO[]>([]);

    const loadPeriods = async () => {
        try {
            const pData = await academicPeriodController.getAll();
            setPeriodsData(pData);
            return pData;
        } catch (error) {
            console.error('Failed to load periods data', error);
            return [];
        }
    };

    const handleSaveRegistrationPeriod = async (onReload: () => void) => {
        if (!selectedSemester || !regPeriodStart || !regPeriodEnd) {
            window.alert('Vui lòng chọn đầy đủ kỳ học và thời gian bắt đầu, kết thúc!');
            return;
        }

        if (new Date(regPeriodStart) >= new Date(regPeriodEnd)) {
            window.alert('Thời gian bắt đầu phải trước thời gian kết thúc!');
            return;
        }

        try {
            await academicPeriodController.save({
                id: editPeriodId || undefined,
                semester: selectedSemester as number,
                period_type: regPeriodType,
                start_date: regPeriodStart,
                end_date: regPeriodEnd
            });
            window.alert('Lưu cấu hình Giai đoạn đăng ký thành công!');
            setIsEditingPeriod(false);
            setEditPeriodId(null);
            setRegPeriodStart('');
            setRegPeriodEnd('');
            onReload();
        } catch (error: any) {
            window.alert(error.message || 'Có lỗi xảy ra.');
        }
    };

    const handleDeleteRegistrationPeriod = async (id: number, onReload: () => void) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thiết lập đợt đăng ký này?')) {
            try {
                await academicPeriodController.delete(id);
                onReload();
            } catch (error: any) {
                window.alert(error.message || 'Xoá thất bại.');
            }
        }
    };

    const handleEditRegistrationPeriod = (period?: AcademicPeriodDTO) => {
        if (period) {
            setEditPeriodId(period.id);
            setSelectedSemester(period.semester);
            setRegPeriodType(period.period_type as any);
            setRegPeriodStart(period.start_date.slice(0, 16));
            setRegPeriodEnd(period.end_date.slice(0, 16));
        } else {
            setEditPeriodId(null);
            setSelectedSemester('');
            setRegPeriodType('register_program');
            setRegPeriodStart('');
            setRegPeriodEnd('');
        }
        setIsEditingPeriod(true);
    };

    return {
        regPeriodType,
        setRegPeriodType,
        regPeriodStart,
        setRegPeriodStart,
        regPeriodEnd,
        setRegPeriodEnd,
        selectedSemester,
        setSelectedSemester,
        periodsData,
        loadPeriods,
        handleSaveRegistrationPeriod,
        isEditingPeriod,
        setIsEditingPeriod,
        editPeriodId,
        setEditPeriodId,
        handleEditRegistrationPeriod,
        handleDeleteRegistrationPeriod,
    };
};
