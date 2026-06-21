import { useState, useCallback, useEffect } from 'react';
import { ClassSuggestion } from '../../../domain/entities/StudentRegistration';
import { classRegistrationController } from '../../../di/student.di';
import { FrontendEventBus, FRONTEND_EVENTS } from '../../../shared/utils/FrontendEventBus';
import { Logger } from '../../../shared/utils/logger';

export const useClassRegistrationViewModel = (
    studentId: number,
    currentRegPeriodType: string,
    setAlarmMessage: (msg: string | null) => void,
    setIsSubmitting: (val: boolean) => void
) => {
    const [expandedCourseIds, setExpandedCourseIds] = useState<Set<number>>(new Set());
    const [courseClassesData, setCourseClassesData] = useState<Record<number, ClassSuggestion[]>>({});
    const [isLoadingClasses, setIsLoadingClasses] = useState<Record<number, boolean>>({});

    // ──────────────────────────────────────────────────────────
    // Fetch / refresh danh sách lớp cho một học phần cụ thể
    // ──────────────────────────────────────────────────────────
    const refreshCourseClasses = useCallback(async (courseId: number) => {
        setIsLoadingClasses(prev => ({ ...prev, [courseId]: true }));
        try {
            const classes = await classRegistrationController.getClassesForCourse(studentId, courseId);
            setCourseClassesData(prev => ({ ...prev, [courseId]: classes }));
            Logger.info(`[useClassRegistrationViewModel] Refreshed class list for courseId=${courseId}`);
        } catch (error: any) {
            Logger.error(`[useClassRegistrationViewModel] refreshCourseClasses error courseId=${courseId}: ${error.message}`);
        } finally {
            setIsLoadingClasses(prev => ({ ...prev, [courseId]: false }));
        }
    }, [studentId]);

    // ──────────────────────────────────────────────────────────
    // Observer: lắng nghe CLASS_SLOTS_CHANGED để tự refresh cache
    // ──────────────────────────────────────────────────────────
    useEffect(() => {
        const handleSlotsChanged = (e: Event) => {
            const courseId = (e as CustomEvent<{ courseId: number }>).detail?.courseId;
            if (courseId) {
                refreshCourseClasses(courseId);
            }
        };

        FrontendEventBus.on(FRONTEND_EVENTS.CLASS_SLOTS_CHANGED, handleSlotsChanged);
        return () => {
            FrontendEventBus.off(FRONTEND_EVENTS.CLASS_SLOTS_CHANGED, handleSlotsChanged);
        };
    }, [refreshCourseClasses]);

    // ──────────────────────────────────────────────────────────
    // Mở / đóng bảng lớp học của một học phần
    // ──────────────────────────────────────────────────────────
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

        // Fetch lần đầu khi chưa có dữ liệu
        if (!courseClassesData[courseId] && !isLoadingClasses[courseId]) {
            await refreshCourseClasses(courseId);
        }
    };

    // ──────────────────────────────────────────────────────────
    // Đăng ký lớp học
    // ──────────────────────────────────────────────────────────
    const registerClass = async (classId: number, courseId: number, classCode: string, showAlertIfInactive = false) => {
        if (currentRegPeriodType !== 'register_class') {
            if (showAlertIfInactive) {
                setAlarmMessage('Hiện không trong giai đoạn đăng ký lớp học.');
            }
            return;
        }

        try {
            setIsSubmitting(true);
            await classRegistrationController.registerClass(studentId, classId);
            setAlarmMessage(`Đã đăng ký lớp học phần ${classCode} thành công.`);

            // Cập nhật occupied_slots trên UI và reload thời khóa biểu
            FrontendEventBus.emit(FRONTEND_EVENTS.CLASS_SLOTS_CHANGED, { courseId });
            FrontendEventBus.emit(FRONTEND_EVENTS.TIMETABLE_CHANGED);
        } catch (error: any) {
            Logger.error(`[useClassRegistrationViewModel] registerClass error classId=${classId}: ${error.message}`);
            setAlarmMessage(error.message || 'Đăng ký thất bại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRegisterClassSection = async (classId: number, courseId: number, classCode: string) => {
        await registerClass(classId, courseId, classCode, true);
    };

    // ──────────────────────────────────────────────────────────
    // Huỷ lớp học
    // ──────────────────────────────────────────────────────────
    const handleCancelClassSection = async (classId: number, courseId: number, classCode: string) => {
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

            // Cập nhật occupied_slots trên UI và reload thời khóa biểu
            FrontendEventBus.emit(FRONTEND_EVENTS.CLASS_SLOTS_CHANGED, { courseId });
            FrontendEventBus.emit(FRONTEND_EVENTS.TIMETABLE_CHANGED);
        } catch (error: any) {
            Logger.error(`[useClassRegistrationViewModel] handleCancelClassSection error classId=${classId}: ${error.message}`);
            setAlarmMessage(error.message || 'Huỷ thất bại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRegisterClassFromSearch = async (classId: number, courseId: number, classCode: string) => {
        await registerClass(classId, courseId, classCode, false);
    };

    return {
        expandedCourseIds,
        courseClassesData,
        isLoadingClasses,
        toggleCourseExpansion,
        handleRegisterClassSection,
        handleCancelClassSection,
        handleRegisterClassFromSearch,
    };
};
