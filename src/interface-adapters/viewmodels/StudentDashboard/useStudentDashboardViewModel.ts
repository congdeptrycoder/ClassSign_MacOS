import { useEffect, useMemo, useState } from 'react';
import { GetAllAcademicPeriodsUseCase } from '../../../application/use-cases/GetAllAcademicPeriodsUseCase';
import { ManageStudentRegistration } from '../../../application/use-cases/ManageStudentRegistration';
import {
    ClassSuggestion,
    CurriculumCourse,
    TimetableEntry,
} from '../../../domain/entities/StudentRegistration';
import { AcademicPeriodRepositoryImpl } from '../../../infrastructure/repositories/AcademicPeriodRepositoryImpl';
import { StudentRegistrationRepositoryImpl } from '../../../infrastructure/repositories/StudentRegistrationRepositoryImpl';
import { AcademicPeriodController } from '../../controllers/AcademicPeriodController';

export interface RegisteredSubject {
    id: string;
    code: string;
    name: string;
    status: string;
    credits: number;
}

export interface TimeEvent {
    day: string;
    period: number;
    name: string;
}

type Suggestion = CurriculumCourse | ClassSuggestion;

const registrationUseCase = new ManageStudentRegistration(
    new StudentRegistrationRepositoryImpl()
);

function toStatusLabel(status: string) {
    if (status === 'completed') return 'Đã học';
    if (status === 'registered') return 'Thành công';
    if (status === 'cancelled') return 'Đã hủy';
    return status;
}

function parseTimetableEvents(entries: TimetableEntry[]): TimeEvent[] {
    return entries.flatMap(entry => {
        if (!entry.detail) return [];

        try {
            const detail = JSON.parse(entry.detail);
            const slots = Array.isArray(detail) ? detail : detail.slots;
            if (!Array.isArray(slots)) return [];

            return slots.flatMap((slot: any) => {
                const periods = Array.isArray(slot.periods)
                    ? slot.periods
                    : [slot.period].filter(Boolean);

                return periods.map((period: number) => ({
                    day: slot.day,
                    period,
                    name: entry.code,
                }));
            });
        } catch (_err) {
            return [];
        }
    });
}

export const useStudentDashboardViewModel = (
    onLogout: () => void,
    studentId = 1,
    onViewCurriculum?: () => void
) => {
    const [isUserInfoVisible, setIsUserInfoVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSuggestionVisible, setIsSuggestionVisible] = useState(false);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [registeredSubjects, setRegisteredSubjects] = useState<RegisteredSubject[]>([]);
    const [timeGridEvents, setTimeGridEvents] = useState<TimeEvent[]>([]);
    const [currentRegPeriodType, setCurrentRegPeriodType] = useState<
        'register_program' | 'register_class' | 'none'
    >('none');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const reloadStudentData = async () => {
        const [registeredCourses, timetable] = await Promise.all([
            registrationUseCase.getRegisteredCourses(studentId),
            registrationUseCase.getTimetable(studentId),
        ]);

        setRegisteredSubjects(
            registeredCourses.map(course => ({
                id: String(course.id),
                code: course.code,
                name: course.name,
                credits: course.credits,
                status: toStatusLabel(course.status),
            }))
        );
        setTimeGridEvents(parseTimetableEvents(timetable));
    };

    const handleSelectSuggestion = (item: Suggestion) => {
        setSelectedSuggestion(item);
        setSearchQuery(item.code);
        setIsSuggestionVisible(false);
    };

    const handleSearchQueryChange = (val: string) => {
        setSearchQuery(val);
        setSelectedSuggestion(null);
        setIsSuggestionVisible(true);
    };

    useEffect(() => {
        const checkRegistrationPeriod = async () => {
            try {
                const periodRepo = new AcademicPeriodRepositoryImpl();
                const getAllPeriodsUseCase = new GetAllAcademicPeriodsUseCase(periodRepo);
                const periodController = new AcademicPeriodController(
                    getAllPeriodsUseCase,
                    null as any,
                    null as any
                );

                const periods = await periodController.getAll();
                const activePeriod = periods.find(p => p.is_active === 1);

                if (activePeriod) {
                    const now = new Date();
                    const start = new Date(activePeriod.start_date);
                    const end = new Date(activePeriod.end_date);

                    if (now >= start && now <= end) {
                        setCurrentRegPeriodType(
                            activePeriod.period_type as 'register_program' | 'register_class'
                        );
                    } else {
                        setCurrentRegPeriodType('none');
                    }
                } else {
                    setCurrentRegPeriodType('none');
                }
            } catch (error) {
                console.error('Lỗi khi kiểm tra đợt đăng ký từ server', error);
                setCurrentRegPeriodType('none');
            }
        };

        checkRegistrationPeriod();
        const interval = setInterval(checkRegistrationPeriod, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        reloadStudentData().catch(error => {
            console.error('Không thể tải dữ liệu sinh viên', error);
        });
    }, [studentId]);

    useEffect(() => {
        const query = searchQuery.trim();
        if (currentRegPeriodType === 'none') {
            setSuggestions([]);
            setSelectedSuggestion(null);
            setIsSearching(false);
            setSearchError(null);
            return;
        }

        const timeout = setTimeout(() => {
            setIsSearching(true);
            setSearchError(null);

            const request =
                currentRegPeriodType === 'register_program'
                    ? registrationUseCase.searchCourseSuggestions(studentId, query)
                    : registrationUseCase.searchClassSuggestions(studentId, query);

            request
                .then(setSuggestions)
                .catch(error => {
                    console.error('Không thể tải gợi ý đăng ký', error);
                    setSearchError(
                        error instanceof Error
                            ? error.message
                            : 'Không thể tải gợi ý đăng ký.'
                    );
                    setSuggestions([]);
                })
                .finally(() => {
                    setIsSearching(false);
                });
        }, 250);

        return () => clearTimeout(timeout);
    }, [currentRegPeriodType, searchQuery, studentId]);

    const fallbackSuggestion = useMemo(() => {
        const normalized = searchQuery.trim().toLowerCase();
        return suggestions.find(
            item =>
                item.code.toLowerCase() === normalized ||
                item.name.toLowerCase() === normalized
        );
    }, [searchQuery, suggestions]);

    const registerTarget = selectedSuggestion ?? fallbackSuggestion;

    const toggleUserInfo = () => {
        setIsUserInfoVisible(currentValue => !currentValue);
    };

    const handleLogout = () => {
        setIsUserInfoVisible(false);
        onLogout();
    };

    const handleViewCurriculum = () => {
        onViewCurriculum?.();
    };

    const handleRegisterSubject = async () => {
        if (currentRegPeriodType === 'none') {
            window.alert('Hiện không trong giai đoạn đăng ký.');
            return;
        }

        if (!searchQuery.trim()) {
            window.alert('Vui lòng nhập mã hoặc tên học phần/lớp học.');
            return;
        }

        if (!registerTarget) {
            window.alert('Vui lòng chọn một gợi ý hợp lệ từ danh sách.');
            return;
        }

        try {
            setIsSubmitting(true);
            if (currentRegPeriodType === 'register_program') {
                await registrationUseCase.registerCourse(
                    studentId,
                    (registerTarget as CurriculumCourse).courseId
                );
                window.alert(`Đã đăng ký học phần ${registerTarget.code}.`);
            } else {
                await registrationUseCase.registerClass(
                    studentId,
                    (registerTarget as ClassSuggestion).id
                );
                window.alert(`Đã đăng ký lớp học phần ${registerTarget.code}.`);
            }

            setSearchQuery('');
            setIsSuggestionVisible(false);
            setSuggestions([]);
            setSelectedSuggestion(null);
            await reloadStudentData();
        } catch (error: any) {
            window.alert(error.message || 'Đăng ký thất bại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        isUserInfoVisible,
        toggleUserInfo,
        searchQuery,
        handleSearchQueryChange,
        isSuggestionVisible,
        setIsSuggestionVisible,
        suggestedSubjects: suggestions,
        isSearching,
        searchError,
        handleSelectSuggestion,
        handleRegisterSubject,
        handleViewCurriculum,
        handleLogout,
        registeredSubjects,
        timeGridEvents,
        currentRegPeriodType,
        isSubmitting,
    };
};
