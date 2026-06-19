import { useState, useMemo, useEffect, useCallback } from 'react';
import { Account } from '../../../domain/entities/Account';
import { CurriculumCourse } from '../../../domain/entities/StudentRegistration';
import { courseRegistrationController, curriculumController } from '../../../di/student.di';

export interface RegisteredSubject {
    id: string;
    courseId: number;
    semester: number;
    code: string;
    name: string;
    rawStatus: string;
    status: string;
    credits: number;
}

const StatusLabelMap: Record<string, string> = {
    'completed': 'Đã học',
    'registered': 'Học phần chưa hoàn thành',
    're_registered': 'Học cải thiện',
    'cancelled': 'Đã hủy',
};

function toStatusLabel(status: string) {
    return StatusLabelMap[status] || status;
}

export const useCourseRegistrationViewModel = (
    studentId: number,
    account: Account | null,
    activeSemesterId: number | null,
    currentRegPeriodType: string,
    setAlarmMessage: (msg: string | null) => void,
    setIsSubmitting: (val: boolean) => void
) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSuggestionVisible, setIsSuggestionVisible] = useState(false);
    const [suggestions, setSuggestions] = useState<CurriculumCourse[]>([]);
    const [curriculumCourses, setCurriculumCourses] = useState<CurriculumCourse[]>([]);
    const [selectedSuggestion, setSelectedSuggestion] = useState<CurriculumCourse | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [registeredSubjects, setRegisteredSubjects] = useState<RegisteredSubject[]>([]);
    const [courseIdToDelete, setCourseIdToDelete] = useState<number | null>(null);

    const reloadCourses = useCallback(async () => {
        try {
            const [registeredCourses, curriculum] = await Promise.all([
                courseRegistrationController.getRegisteredCourses(studentId),
                curriculumController.getCurriculum(studentId)
            ]);

            setRegisteredSubjects(
                registeredCourses.map(course => ({
                    id: String(course.id),
                    courseId: course.courseId,
                    semester: course.semester,
                    code: course.code,
                    name: course.name,
                    credits: course.credits,
                    rawStatus: course.status,
                    status: toStatusLabel(course.status),
                }))
            );
            setCurriculumCourses(curriculum.courses);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu đăng ký học phần', error);
        }
    }, [studentId]);

    useEffect(() => {
        reloadCourses();
    }, [reloadCourses]);

    useEffect(() => {
        const query = searchQuery.trim().toLowerCase();
        if (currentRegPeriodType !== 'register_program') {
            setSuggestions([]);
            setSelectedSuggestion(null);
            setIsSearching(false);
            setSearchError(null);
            return;
        }

        const timeout = setTimeout(() => {
            setIsSearching(true);
            setSearchError(null);
            const filtered = curriculumCourses.filter(course =>
                !query || course.code.toLowerCase().includes(query) || course.name.toLowerCase().includes(query)
            ).slice(0, 10);
            setSuggestions(filtered);
            setIsSearching(false);
        }, 250);

        return () => clearTimeout(timeout);
    }, [currentRegPeriodType, searchQuery, curriculumCourses]);

    const handleSelectSuggestion = (item: CurriculumCourse) => {
        setSelectedSuggestion(item);
        setSearchQuery(item.code);
        setIsSuggestionVisible(false);
    };

    const handleSearchQueryChange = (val: string) => {
        setSearchQuery(val);
        setSelectedSuggestion(null);
        setIsSuggestionVisible(true);
    };

    const totalCredits = useMemo(() => {
        return registeredSubjects
            .filter(subject => subject.semester === activeSemesterId)
            .reduce((sum, subject) => sum + subject.credits, 0);
    }, [registeredSubjects, activeSemesterId]);

    const maxCredits = useMemo(() => {
        if (!account) return 24;
        if (typeof account.getMaxAllowedCredits === 'function') {
            return account.getMaxAllowedCredits();
        }
        const tempAccount = new Account(account.id, account.username, account.name, account.role, account.id_card, account.status);
        return tempAccount.getMaxAllowedCredits();
    }, [account]);

    const statusNote = useMemo(() => {
        if (!account) return 'Bạn được đăng ký tối đa 24 TC';
        if (typeof account.getRegistrationStatusNote === 'function') {
            return account.getRegistrationStatusNote();
        }
        const tempAccount = new Account(account.id, account.username, account.name, account.role, account.id_card, account.status);
        return tempAccount.getRegistrationStatusNote();
    }, [account]);

    const handleRegisterSubject = async () => {
        if (currentRegPeriodType !== 'register_program') return;

        if (!searchQuery.trim()) {
            setAlarmMessage('Vui lòng nhập mã hoặc tên học phần.');
            return;
        }

        const fallbackSuggestion = suggestions.find(item => item.code.toLowerCase() === searchQuery.trim().toLowerCase() || item.name.toLowerCase() === searchQuery.trim().toLowerCase());
        const registerTarget = selectedSuggestion ?? fallbackSuggestion;

        if (!registerTarget) {
            setAlarmMessage('Vui lòng chọn một gợi ý hợp lệ từ danh sách.');
            return;
        }

        const isAlreadyRegistered = registeredSubjects.some(sub => sub.courseId === registerTarget.courseId);
        const additionalCredits = isAlreadyRegistered ? 0 : registerTarget.credits;

        if (totalCredits + additionalCredits > maxCredits) {
            setAlarmMessage(`Tổng số TC vượt quá giới hạn. Số TC cho phép của bạn là ${maxCredits} TC.`);
            return;
        }

        try {
            setIsSubmitting(true);
            const result = await courseRegistrationController.registerCourse(studentId, registerTarget.courseId);
            setAlarmMessage(result.message);
            setSearchQuery('');
            setIsSuggestionVisible(false);
            setSuggestions([]);
            setSelectedSuggestion(null);
            await reloadCourses();
        } catch (error: any) {
            setAlarmMessage(error.message || 'Đăng ký thất bại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDeleteCourse = async () => {
        if (!courseIdToDelete) return;
        try {
            setIsSubmitting(true);
            await courseRegistrationController.cancelCourseRegistration(studentId, courseIdToDelete);
            await reloadCourses();
            setAlarmMessage('Xoá đăng ký học phần thành công.');
        } catch (error: any) {
            setAlarmMessage(error.message || 'Xoá thất bại.');
        } finally {
            setIsSubmitting(false);
            setCourseIdToDelete(null);
        }
    };

    return {
        searchQuery,
        handleSearchQueryChange,
        isSuggestionVisible,
        setIsSuggestionVisible,
        suggestedSubjects: suggestions,
        isSearching,
        searchError,
        handleSelectSuggestion,
        handleRegisterSubject,
        registeredSubjects,
        totalCredits,
        maxCredits,
        statusNote,
        courseIdToDelete,
        promptDeleteCourse: setCourseIdToDelete,
        cancelDeleteCourse: () => setCourseIdToDelete(null),
        confirmDeleteCourse,
        reloadCourses
    };
};
