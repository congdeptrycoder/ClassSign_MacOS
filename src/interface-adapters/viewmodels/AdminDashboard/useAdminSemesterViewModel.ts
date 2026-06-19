import { useState } from 'react';
import { semesterController } from '../../../di/admin.di';
import { SemesterDTO } from '../../../application/dto/SemesterDTO';

export const useAdminSemesterViewModel = () => {
    const [semestersData, setSemestersData] = useState<SemesterDTO[]>([]);
    const [isCreateSemesterModalOpen, setCreateSemesterModalOpen] = useState(false);
    const [newSemesterCode, setNewSemesterCode] = useState('');

    const loadSemesters = async () => {
        try {
            const sData = await semesterController.getAllSemesters();
            setSemestersData(sData);
            return sData;
        } catch (error) {
            console.error('Failed to load semesters data', error);
            return [];
        }
    };

    const handleCreateSemester = async () => {
        if (!newSemesterCode || newSemesterCode.trim() === '') {
            window.alert('Vui lòng nhập mã kỳ!');
            return;
        }
        try {
            await semesterController.createSemester(newSemesterCode);
            window.alert('Thêm học kỳ mới thành công!');
            setCreateSemesterModalOpen(false);
            setNewSemesterCode('');
            await loadSemesters();
        } catch (error: any) {
            window.alert(error.message || 'Lỗi thêm học kỳ.');
        }
    };

    return {
        semestersData,
        loadSemesters,
        isCreateSemesterModalOpen,
        setCreateSemesterModalOpen,
        newSemesterCode,
        setNewSemesterCode,
        handleCreateSemester,
    };
};
