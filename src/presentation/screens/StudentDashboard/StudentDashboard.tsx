import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    RegisteredSubject,
    TimeEvent,
    useStudentDashboardViewModel,
} from '../../../interface-adapters/viewmodels/StudentDashboard/useStudentDashboardViewModel';
import { useTheme } from '../../components/ThemeContext';
import hustLogo from '../../../../public/images/hust-logo.png';
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
                {currentRegPeriodType === 'none' ? (
                    <div className="welcome-banner" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <h2 className="what-time-is-it">Đang không có lịch đăng ký</h2>
                    </div>
                ) : (
                    <>
                        <div className="welcome-banner">
                            <h2 className="what-time-is-it">
                                {currentRegPeriodType === 'register_program' 
                                    ? 'Đây đang là giai đoạn đăng ký học phần' 
                                    : 'Đây đang là giai đoạn đăng ký lớp học'}
                            </h2>
                        </div>

                        <div className="student-actions card">
                            <button className="action-btn secondary-btn" onClick={handleViewCurriculum}>
                                Xem Chương Trình Đào Tạo
                            </button>
                            <div className="registration-box" style={{ position: 'relative', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <input
                                        className="search-input"
                                        placeholder="Nhập mã/tên học phần"
                                        value={searchQuery}
                                        onChange={(e) => handleSearchQueryChange(e.target.value)}
                                        onFocus={() => setIsSuggestionVisible(true)}
                                        onBlur={() => setTimeout(() => setIsSuggestionVisible(false), 200)}
                                        style={{ width: '100%', boxSizing: 'border-box' }}
                                    />
                                    {isSuggestionVisible && suggestedSubjects.length > 0 && (
                                        <div className="suggestions-dropdown" style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            backgroundColor: isDark ? '#2d2d2d' : 'white',
                                            color: isDark ? '#fff' : '#000',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                            zIndex: 10,
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            marginTop: '4px',
                                            textAlign: 'left'
                                        }}>
                                            {suggestedSubjects.map((sub, idx) => (
                                                <div 
                                                    key={idx}
                                                    className="suggestion-item"
                                                    style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                                    onClick={() => handleSelectSuggestion(sub.code)}
                                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDark ? '#3d3d3d' : '#f0f0f0')}
                                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                                >
                                                    <strong>{sub.code}</strong> - {sub.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button className="primary-btn" onClick={handleRegisterSubject} style={{ height: '40px' }}>
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

                        {currentRegPeriodType === 'register_class' && (
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
                        )}
                    </>
                )}
            </main>
        </div>
    );
};
