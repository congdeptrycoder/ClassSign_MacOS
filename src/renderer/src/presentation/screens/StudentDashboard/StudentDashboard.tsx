import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    RegisteredSubject,
    TimeEvent,
    useStudentDashboardViewModel,
} from '../../../../../interface-adapters/viewmodels/StudentDashboard/useStudentDashboardViewModel';
import { useTheme } from '../../components/ThemeContext';
import hustLogo from '../../../../../../public/images/hust-logo.png';
import './StudentDashboard.css';

const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const morningPeriods = [1, 2, 3, 4, 5, 6];
const afternoonPeriods = [7, 8, 9, 10, 11, 12];

export const StudentDashboard = () => {
    const navigate = useNavigate();
    const onLogout = () => navigate('/login');

    const {
        isUserInfoVisible,
        toggleUserInfo,
        searchQuery,
        setSearchQuery,
        handleRegisterSubject,
        handleViewCurriculum,
        handleLogout,
        registeredSubjects,
        timeGridEvents,
    } = useStudentDashboardViewModel(onLogout);

    const { isDark, toggleTheme } = useTheme();

    return (
        <div className="student-container">
            <header className="nav-bar">
                <div className="nav-left">
                    <img src={hustLogo} alt="Logo" className="nav-logo" />
                    <span className="nav-title">Đăng ký học tập</span>
                </div>
                <div className="nav-right">
                    <button className="icon-btn" onClick={toggleTheme}>
                        {isDark ? '☀️' : '🌙'}
                    </button>
                    <div className="profile-trigger" onClick={toggleUserInfo}>
                        <img src={hustLogo} alt="Avatar" className="avatar" />
                    </div>
                </div>
            </header>

            {isUserInfoVisible && (
                <div className="user-profile-popover card">
                    <p className="user-name">Phan Chí Công - 20231566</p>
                    <button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
                </div>
            )}

            <main className="student-content">
                <div className="welcome-banner">
                    <h2 className="what-time-is-it">Đây đang là giai đoạn đăng ký học phần TEST</h2>
                </div>

                <div className="student-actions card">
                    <button className="action-btn secondary-btn" onClick={handleViewCurriculum}>
                        Xem Chương Trình Đào Tạo
                    </button>
                    <div className="registration-box">
                        <input
                            className="search-input"
                            placeholder="Nhập mã/tên học phần"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="primary-btn" onClick={handleRegisterSubject}>
                            Đăng ký
                        </button>
                    </div>
                </div>

                <section className="registration-table card">
                    <h3 className="section-title">Bảng Thông tin đăng ký</h3>
                    <div className="table-scroll">
                        <table className="info-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Mã HP</th>
                                    <th>Tên học phần</th>
                                    <th>TT Đăng ký</th>
                                    <th>Số TC</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registeredSubjects.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.code}</td>
                                        <td>{item.name}</td>
                                        <td className="status-cell">{item.status}</td>
                                        <td>{item.credits}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="timetable-section card">
                    <h3 className="section-title">Thời khóa biểu tạm thời</h3>
                    <div className="table-scroll">
                        <div className="time-grid">
                            <div className="grid-header">
                                <div className="grid-cell corner"></div>
                                {daysOfWeek.map((day) => (
                                    <div key={day} className="grid-cell day-header">{day}</div>
                                ))}
                            </div>

                            {morningPeriods.map((period) => (
                                <div key={`m-${period}`} className="grid-row">
                                    <div className="grid-cell period-label">Tiết {period}</div>
                                    {daysOfWeek.map((day) => {
                                        const event = timeGridEvents.find(e => e.day === day && e.period === period);
                                        return (
                                            <div key={`${day}-${period}`} className={`grid-cell ${event ? 'active' : ''}`}>
                                                {event && <span className="event-name">{event.name}</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}

                            <div className="grid-divider">Nghỉ trưa</div>

                            {afternoonPeriods.map((period) => (
                                <div key={`a-${period}`} className="grid-row">
                                    <div className="grid-cell period-label">Tiết {period}</div>
                                    {daysOfWeek.map((day) => {
                                        const event = timeGridEvents.find(e => e.day === day && e.period === period);
                                        return (
                                            <div key={`${day}-${period}`} className={`grid-cell ${event ? 'active' : ''}`}>
                                                {event && <span className="event-name">{event.name}</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};
