import React, { useState, useEffect } from 'react';

import { AcademicPeriodRepositoryImpl } from '../../../infrastructure/repositories/AcademicPeriodRepositoryImpl';
import { GetAllAcademicPeriodsUseCase } from '../../../application/use-cases/GetAllAcademicPeriodsUseCase';
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

export const useStudentDashboardViewModel = (onLogout: () => void) => {
    const [isUserInfoVisible, setIsUserInfoVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSuggestionVisible, setIsSuggestionVisible] = useState(false);
    
    const [registeredSubjects, setRegisteredSubjects] = useState<RegisteredSubject[]>([
        { id: '1', code: 'IT3040', name: 'Kỹ thuật phần mềm', status: 'Thành công', credits: 3 },
        { id: '2', code: 'IT3020', name: 'Toán rời rạc', status: 'Thành công', credits: 3 },
    ]);
    const [currentRegPeriodType, setCurrentRegPeriodType] = useState<'register_program' | 'register_class' | 'none'>('none');

    // Danh sách học phần được phép đăng ký (Mock)
    const allowedSubjects = React.useMemo(() => [
        { code: 'IT4060', name: 'Thiết kế hệ thống mạng', credits: 3 },
        { code: 'MI2010', name: 'Toán cao cấp', credits: 4 },
        { code: 'IT1110', name: 'Tin học đại cương', credits: 4 },
        { code: 'IT2120', name: 'Kiến trúc máy tính', credits: 3 },
    ], []);

    const suggestedSubjects = React.useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.trim().toLowerCase();
        return allowedSubjects.filter(
            sub => sub.code.toLowerCase().includes(query) || sub.name.toLowerCase().includes(query)
        );
    }, [searchQuery, allowedSubjects]);

    const handleSelectSuggestion = (code: string) => {
        setSearchQuery(code);
        setIsSuggestionVisible(false);
    };

    const handleSearchQueryChange = (val: string) => {
        setSearchQuery(val);
        setIsSuggestionVisible(true);
    };

        // Kiểm tra thời gian đăng ký hiện tại
    useEffect(() => {
        const checkRegistrationPeriod = async () => {
            try {
                // Initialize Controller manually since we don't have DI
                const periodRepo = new AcademicPeriodRepositoryImpl();
                const getAllPeriodsUseCase = new GetAllAcademicPeriodsUseCase(periodRepo);
                // We pass dummy use cases for save and delete since we don't use them here
                const periodController = new AcademicPeriodController(getAllPeriodsUseCase, null as any, null as any);
                
                const periods = await periodController.getAll();
                const activePeriod = periods.find(p => p.is_active === 1);
                
                if (activePeriod) {
                    const now = new Date();
                    const start = new Date(activePeriod.start_date);
                    const end = new Date(activePeriod.end_date);
                    
                    if (now >= start && now <= end) {
                        setCurrentRegPeriodType(activePeriod.period_type as 'register_program' | 'register_class');
                    } else {
                        setCurrentRegPeriodType('none');
                    }
                } else {
                    setCurrentRegPeriodType('none');
                }
            } catch (error) {
                console.error("Lỗi khi kiểm tra đợt đăng ký từ server", error);
                setCurrentRegPeriodType('none');
            }
        };

        checkRegistrationPeriod();
        const interval = setInterval(checkRegistrationPeriod, 60000);
        return () => clearInterval(interval);
    }, []);

    const toggleUserInfo = () => {
        setIsUserInfoVisible(currentValue => !currentValue);
    };

    const handleLogout = () => {
        setIsUserInfoVisible(false);
        onLogout();
    };

    const handleViewCurriculum = () => {
        window.open('https://fed.hust.edu.vn', '_blank');
    };

    const handleRegisterSubject = () => {
        if (!searchQuery.trim()) {
            window.alert('Vui lòng nhập mã hoặc tên học phần!');
            return;
        }

        const query = searchQuery.trim().toLowerCase();
        
        // Kiểm tra xem có nằm trong danh sách cho phép không
        const subjectFound = allowedSubjects.find(
            sub => sub.code.toLowerCase() === query || sub.name.toLowerCase() === query
        );

        if (!subjectFound) {
            window.alert(`Học phần "${searchQuery}" không cho phép đăng ký hoặc không tồn tại trong chương trình của bạn!`);
            return;
        }

        // Kiểm tra xem đã đăng ký chưa
        const alreadyRegistered = registeredSubjects.some(
            sub => sub.code === subjectFound.code
        );

        if (alreadyRegistered) {
            window.alert(`Học phần ${subjectFound.code} - ${subjectFound.name} đã được đăng ký trước đó!`);
            return;
        }

        // Thêm vào danh sách
        const newSubject: RegisteredSubject = {
            id: Date.now().toString(),
            code: subjectFound.code,
            name: subjectFound.name,
            status: 'Thành công',
            credits: subjectFound.credits
        };

        setRegisteredSubjects([...registeredSubjects, newSubject]);
        setSearchQuery('');
        setIsSuggestionVisible(false);
        window.alert(`Đăng ký thành công học phần: ${subjectFound.code} - ${subjectFound.name}`);
    };

    const timeGridEvents: TimeEvent[] = [
        { day: 'T2', period: 1, name: 'IT3040' },
        { day: 'T2', period: 2, name: 'IT3040' },
        { day: 'T3', period: 3, name: 'IT3020' },
        { day: 'T3', period: 4, name: 'IT3020' },
        { day: 'T5', period: 7, name: 'IT4060' },
        { day: 'T5', period: 8, name: 'IT4060' },
    ];

    return {
        isUserInfoVisible,
        toggleUserInfo,
        searchQuery,
        handleSearchQueryChange,
        isSuggestionVisible,
        setIsSuggestionVisible,
        suggestedSubjects,
        handleSelectSuggestion,
        handleRegisterSubject,
        handleViewCurriculum,
        handleLogout,
        registeredSubjects,
        timeGridEvents,
        currentRegPeriodType,
    };
};
