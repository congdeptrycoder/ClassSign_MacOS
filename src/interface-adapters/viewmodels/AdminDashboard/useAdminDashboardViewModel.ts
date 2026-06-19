import { useState, useEffect } from 'react';
import { useAdminSemesterViewModel } from './useAdminSemesterViewModel';
import { useAdminPeriodViewModel } from './useAdminPeriodViewModel';
import { useAdminClassViewModel, ClassInfo } from './useAdminClassViewModel';

// Re-export ClassInfo for consumers that import from this module
export type { ClassInfo };

export const useAdminDashboardViewModel = (
    onNavigateToEdit?: (item: ClassInfo) => void,
    onLogout?: () => void,
) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const toggleProfile = () => {
        setIsProfileOpen(currentValue => !currentValue);
    };

    const handleLogout = () => {
        setIsProfileOpen(false);
        onLogout?.();
    };

    const handleUpload = () => {
        window.alert('Upload: Chức năng upload file (.xlsx) sẽ được thực hiện.');
    };

    // Compose child viewmodels
    const semesterVM = useAdminSemesterViewModel();
    const periodVM = useAdminPeriodViewModel();
    const classVM = useAdminClassViewModel(onNavigateToEdit);

    // Coordinated data loading: semesters + periods load together,
    // and semester selection is synced to class VM
    const loadData = async () => {
        const sData = await semesterVM.loadSemesters();
        await periodVM.loadPeriods();

        if (sData.length > 0 && periodVM.selectedSemester === '') {
            periodVM.setSelectedSemester(sData[0].id);
        }
        if (sData.length > 0 && classVM.selectedClassSemesterId === '') {
            classVM.setSelectedClassSemesterId(sData[0].id);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Wrap period save/delete to reload shared data
    const handleSaveRegistrationPeriod = () => periodVM.handleSaveRegistrationPeriod(loadData);
    const handleDeleteRegistrationPeriod = (id: number) => periodVM.handleDeleteRegistrationPeriod(id, loadData);

    // Wrap semester create to reload shared data
    const handleCreateSemester = async () => {
        await semesterVM.handleCreateSemester();
        await loadData();
    };

    return {
        // Profile
        isProfileOpen,
        toggleProfile,
        handleLogout,
        handleUpload,
        // Class management
        filters: classVM.filters,
        handleFilterChange: classVM.handleFilterChange,
        classesData: classVM.classesData,
        filteredClassesData: classVM.filteredClassesData,
        handleEdit: classVM.handleEdit,
        handleDelete: classVM.handleDelete,
        selectedClassSemesterId: classVM.selectedClassSemesterId,
        setSelectedClassSemesterId: classVM.setSelectedClassSemesterId,
        // Period management
        regPeriodType: periodVM.regPeriodType,
        setRegPeriodType: periodVM.setRegPeriodType,
        regPeriodStart: periodVM.regPeriodStart,
        setRegPeriodStart: periodVM.setRegPeriodStart,
        regPeriodEnd: periodVM.regPeriodEnd,
        setRegPeriodEnd: periodVM.setRegPeriodEnd,
        selectedSemester: periodVM.selectedSemester,
        setSelectedSemester: periodVM.setSelectedSemester,
        periodsData: periodVM.periodsData,
        handleSaveRegistrationPeriod,
        isEditingPeriod: periodVM.isEditingPeriod,
        setIsEditingPeriod: periodVM.setIsEditingPeriod,
        editPeriodId: periodVM.editPeriodId,
        setEditPeriodId: periodVM.setEditPeriodId,
        handleEditRegistrationPeriod: periodVM.handleEditRegistrationPeriod,
        handleDeleteRegistrationPeriod,
        // Semester management
        semestersData: semesterVM.semestersData,
        isCreateSemesterModalOpen: semesterVM.isCreateSemesterModalOpen,
        setCreateSemesterModalOpen: semesterVM.setCreateSemesterModalOpen,
        newSemesterCode: semesterVM.newSemesterCode,
        setNewSemesterCode: semesterVM.setNewSemesterCode,
        handleCreateSemester,
    };
};
