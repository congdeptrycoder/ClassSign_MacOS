import { useState } from 'react';

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

    const toggleUserInfo = () => {
        setIsUserInfoVisible(currentValue => !currentValue);
    };

    const handleLogout = () => {
        setIsUserInfoVisible(false);
        onLogout();
    };

    const handleViewCurriculum = () => {
        console.log('Xem chương trình đào tạo');
        window.alert('Chức năng Xem chương trình đào tạo');
    };

    const handleRegisterSubject = () => {
        console.log('Đăng ký học phần:', searchQuery);
        window.alert(`Đăng ký học phần: ${searchQuery}`);
    };

    const registeredSubjects: RegisteredSubject[] = [
        {
            id: '1',
            code: 'IT3040',
            name: 'Kỹ thuật phần mềm',
            status: 'Thành công',
            credits: 3,
        },
        {
            id: '2',
            code: 'IT3020',
            name: 'Toán rời rạc',
            status: 'Thành công',
            credits: 3,
        },
        {
            id: '3',
            code: 'IT4060',
            name: 'Thiết kế hệ thống mạng',
            status: 'Thành công',
            credits: 3,
        },
    ];

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
        setSearchQuery,
        handleRegisterSubject,
        handleViewCurriculum,
        handleLogout,
        registeredSubjects,
        timeGridEvents,
    };
};
