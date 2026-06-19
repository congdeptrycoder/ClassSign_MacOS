import { useState, useCallback } from 'react';
import { ClassSuggestion } from '../../../domain/entities/StudentRegistration';
import { classRegistrationController } from '../../../di/student.di';
import { FrontendEventBus, FRONTEND_EVENTS } from '../../../shared/utils/FrontendEventBus';

export const useClassRegistrationViewModel = (
    studentId: number,
    currentRegPeriodType: string,
    setAlarmMessage: (msg: string | null) => void,
    setIsSubmitting: (val: boolean) => void
) => {
    const [expandedCourseIds, setExpandedCourseIds] = useState<Set<number>>(new Set());
    const [courseClassesData, setCourseClassesData] = useState<Record<number, ClassSuggestion[]>>({});
    const [isLoadingClasses, setIsLoadingClasses] = useState<Record<number, boolean>>({});

    const toggleCourseExpansion = async (courseId: number) => {
        setExpandedCourseIds(prev => {
            const next = new Set(prev);
            if (next.has(courseId)) {
                next.delete(courseId);
            } else {
                next.add(courseId);
            }
            return next;
        });

        if (!courseClassesData[courseId] && !isLoadingClasses[courseId]) {
            setIsLoadingClasses(prev => ({ ...prev, [courseId]: true }));
            try {
                const classes = await classRegistrationController.getClassesForCourse(studentId, courseId);
                setCourseClassesData(prev => ({ ...prev, [courseId]: classes }));
            } catch (error) {
                console.error('Lỗi khi tải danh sách lớp', error);
                setAlarmMessage('Không thể tải danh sách lớp học phần này.');
            } finally {
                setIsLoadingClasses(prev => ({ ...prev, [courseId]: false }));
            }
        }
    };

    const handleRegisterClassSection = async (classId: number, classCode: string) => {
        if (currentRegPeriodType !== 'register_class') {
            setAlarmMessage('Hiện không trong giai đoạn đăng ký lớp học.');
            return;
        }

        try {
            setIsSubmitting(true);
            await classRegistrationController.registerClass(studentId, classId);
            setAlarmMessage(`Đã đăng ký lớp học phần ${classCode} thành công.`);
            FrontendEventBus.emit(FRONTEND_EVENTS.TIMETABLE_CHANGED);
        } catch (error: any) {
            setAlarmMessage(error.message || 'Đăng ký thất bại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelClassSection = async (classId: number, classCode: string) => {
        if (currentRegPeriodType !== 'register_class') {
            setAlarmMessage('Hiện không trong giai đoạn đăng ký lớp học.');
            return;
        }

        if (!window.confirm(`Bạn có chắc chắn muốn huỷ đăng ký lớp ${classCode}?`)) {
            return;
        }

        try {
            setIsSubmitting(true);
            await classRegistrationController.cancelClassRegistration(studentId, classId);
            setAlarmMessage(`Đã huỷ lớp học phần ${classCode} thành công.`);
            FrontendEventBus.emit(FRONTEND_EVENTS.TIMETABLE_CHANGED);
        } catch (error: any) {
            setAlarmMessage(error.message || 'Huỷ thất bại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Thêm hàm registerClass từ thanh tìm kiếm
    const handleRegisterClassFromSearch = async (classId: number, classCode: string) => {
        if (currentRegPeriodType !== 'register_class') return;
        try {
            setIsSubmitting(true);
            await classRegistrationController.registerClass(studentId, classId);
            setAlarmMessage(`Đã đăng ký lớp học phần ${classCode} thành công.`);
            FrontendEventBus.emit(FRONTEND_EVENTS.TIMETABLE_CHANGED);
        } catch (error: any) {
            setAlarmMessage(error.message || 'Đăng ký thất bại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        expandedCourseIds,
        courseClassesData,
        isLoadingClasses,
        toggleCourseExpansion,
        handleRegisterClassSection,
        handleCancelClassSection,
        handleRegisterClassFromSearch
    };
};
