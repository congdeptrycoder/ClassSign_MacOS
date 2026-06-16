import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentDashboardViewModel } from '../../../interface-adapters/viewmodels/StudentDashboard/useStudentDashboardViewModel';
import { useTheme } from '../../components/ThemeContext';
import {
    clearCurrentAccount,
    getCurrentAccount,
} from '../../../shared/session/currentUserSession';
import hustLogo from '../../../../public/images/hust-logo.png';
import { AlarmOneChoose } from '../../components/AlarmOneChoose/AlarmOneChoose';
import { AlarmTwoChoose } from '../../components/AlarmTwoChoose/AlarmTwoChoose';
import './StudentDashboard.css';

const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const morningPeriods = [1, 2, 3, 4, 5, 6];
const afternoonPeriods = [7, 8, 9, 10, 11, 12];

export const StudentDashboard = () => {
    const navigate = useNavigate();
    const account = getCurrentAccount();
    const onLogout = () => {
        clearCurrentAccount();
        navigate('/login');
    };
    const onViewCurriculum = () => navigate('/student/curriculum');

    const {
        isUserInfoVisible,
        toggleUserInfo,
        searchQuery,
        handleSearchQueryChange,
        isSuggestionVisible,
        setIsSuggestionVisible,
        suggestedSubjects,
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
        alarmMessage,
        setAlarmMessage,
        courseIdToDelete,
        promptDeleteCourse,
        cancelDeleteCourse,
        confirmDeleteCourse,
        activeSemesterId,
        activeSemesterName,
        totalCredits,
        statusNote,
        expandedCourseIds,
        courseClassesData,
        isLoadingClasses,
        toggleCourseExpansion,
        handleRegisterClassSection,
    } = useStudentDashboardViewModel(onLogout, account ?? null, onViewCurriculum);

    const { isDark, toggleTheme } = useTheme();
    const studentLabel = `${account?.name ?? 'Sinh viên'} - ${account?.id_card ?? account?.username ?? account?.id ?? ''}`;
    const isRegistrationOpen = currentRegPeriodType !== 'none';

    const phaseTitle = currentRegPeriodType === 'register_program'
        ? 'Đợt đăng ký học phần'
        : currentRegPeriodType === 'register_class'
            ? 'Đợt đăng ký lớp học'
            : 'Không có lịch đăng ký';

    const phaseBadge = isRegistrationOpen ? 'Đang mở' : 'Đã đóng';
    const searchLabel = currentRegPeriodType === 'register_program'
        ? 'Tìm học phần'
        : 'Tìm lớp học phần';

    const getRegisteredStatusClass = (rawStatus: string) => {
        if (rawStatus === 'registered' || rawStatus === 're_registered') return 'registered';
        if (rawStatus === 'completed') return 'completed';
        return 'available';
    };

    const displayedSubjects = activeSemesterId
        ? registeredSubjects.filter(item => item.semester === activeSemesterId)
        : [];

    return (
        <div className="student-container">
            {alarmMessage && (
                <AlarmOneChoose
                    message={alarmMessage}
                    buttonText="Đóng"
                    onClose={() => setAlarmMessage(null)}
                />
            )}
            {courseIdToDelete && (
                <AlarmTwoChoose
                    message="Xác nhận xoá đăng ký học phần này"
                    button1Text="Huỷ"
                    button2Text="Xác nhận"
                    onButton1Click={cancelDeleteCourse}
                    onButton2Click={confirmDeleteCourse}
                />
            )}
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
                    <p className="user-name">{studentLabel}</p>
                    <button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
                </div>
            )}

            <main className="student-content">
                <section className="student-page-head">
                    <div>
                        <p className="page-kicker">Hệ thống đăng ký học tập</p>
                        <h1>
                            {phaseTitle}
                            {activeSemesterName && ` - Học kỳ ${activeSemesterName}`}
                        </h1>
                    </div>
                    <span className={`phase-badge ${isRegistrationOpen ? 'open' : 'closed'}`}>
                        {phaseBadge}
                    </span>
                </section>

                {currentRegPeriodType === 'register_program' && (
                    <section className="registration-panel card">
                        <div className="panel-header">
                            <div>
                                <h2>{searchLabel}</h2>
                                <p>{studentLabel}</p>
                            </div>
                            <button className="outline-btn" onClick={handleViewCurriculum}>
                                Xem CTĐT
                            </button>
                        </div>

                        {isRegistrationOpen && (
                            <div className="registration-box">
                                <div className="suggestion-anchor">
                                    <input
                                        className="search-input"
                                        placeholder="Nhập mã hoặc tên học phần"
                                        value={searchQuery}
                                        onChange={(e) => handleSearchQueryChange(e.target.value)}
                                        onFocus={() => setIsSuggestionVisible(true)}
                                        onBlur={() => setTimeout(() => setIsSuggestionVisible(false), 200)}
                                    />
                                    {isSuggestionVisible && searchQuery.trim() && (
                                        <div
                                            className="suggestions-dropdown"
                                            onMouseDown={(e) => e.preventDefault()}
                                        >
                                            {isSearching && (
                                                <div className="suggestion-state">Đang tìm...</div>
                                            )}
                                            {!isSearching && searchError && (
                                                <div className="suggestion-state error">{searchError}</div>
                                            )}
                                            {!isSearching && !searchError && suggestedSubjects.length === 0 && (
                                                <div className="suggestion-state">Không có gợi ý phù hợp</div>
                                            )}
                                            {!isSearching && !searchError && suggestedSubjects.map((sub, idx) => (
                                                <button
                                                    key={`${sub.code}-${idx}`}
                                                    className="suggestion-item"
                                                    type="button"
                                                    onClick={() => handleSelectSuggestion(sub)}
                                                >
                                                    <span className="suggestion-code">{sub.code}</span>
                                                    <span className="suggestion-name">{sub.name}</span>
                                                    <span className="suggestion-credits">{sub.credits} TC</span>
                                                    {'statusLabel' in sub && (
                                                        <span className={`suggestion-status status-${sub.status}`}>
                                                            {sub.statusLabel}
                                                        </span>
                                                    )}
                                                    {'occupiedSlots' in sub && (
                                                        <span className="suggestion-status status-available">
                                                            Còn {sub.totalSlots - sub.occupiedSlots}/{sub.totalSlots} chỗ
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button
                                    className="primary-btn"
                                    onClick={handleRegisterSubject}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
                                </button>
                            </div>
                        )}
                    </section>
                )}

                {!isRegistrationOpen && (
                    <div className="no-phase-panel card">
                        <h3>Đang không có lịch đăng ký</h3>
                        <p>Vui lòng quay lại sau hoặc liên hệ Phòng đào tạo để biết thêm chi tiết.</p>
                    </div>
                )}

                <section className="registration-table card">
                    <h3 className="section-title">Bảng thông tin đăng ký</h3>
                    <div className="table-scroll">
                        <table className="info-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>DS Lớp</th>
                                    <th>ID</th>
                                    <th>Mã HP</th>
                                    <th>Tên học phần</th>
                                    <th>TT đăng ký</th>
                                    <th>Số TC</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedSubjects.map((item) => (
                                    <React.Fragment key={item.id}>
                                        <tr className={expandedCourseIds.has(item.courseId) ? 'expanded-row' : ''}>
                                            <td>
                                                <button
                                                    className="expand-btn"
                                                    onClick={() => toggleCourseExpansion(item.courseId)}
                                                >
                                                    {expandedCourseIds.has(item.courseId) ? '▼' : '▶'}
                                                </button>
                                            </td>
                                            <td>{item.id}</td>
                                            <td><span className="course-code">{item.code}</span></td>
                                            <td>{item.name}</td>
                                            <td>
                                                <span className={`table-status status-${getRegisteredStatusClass(item.rawStatus)}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td>{item.credits}</td>
                                            <td>
                                                <button
                                                    className="outline-btn"
                                                    onClick={() => promptDeleteCourse(item.courseId)}
                                                    disabled={isSubmitting}
                                                >
                                                    Xoá
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedCourseIds.has(item.courseId) && (
                                            <tr className="sub-table-row">
                                                <td colSpan={7} style={{ padding: 0 }}>
                                                    <div className="sub-table-container" style={{ padding: '16px', background: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
                                                        <h4 style={{ margin: '0 0 12px 0' }}>Danh sách lớp học phần</h4>
                                                        {isLoadingClasses[item.courseId] ? (
                                                            <p>Đang tải...</p>
                                                        ) : (
                                                            <table className="info-table sub-table" style={{ margin: 0 }}>
                                                                <thead>
                                                                    <tr>
                                                                        <th>Mã Lớp</th>
                                                                        <th>Chi tiết lịch học</th>
                                                                        <th>Số chỗ</th>
                                                                        {currentRegPeriodType === 'register_class' && <th>Hành động</th>}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {courseClassesData[item.courseId]?.length > 0 ? (
                                                                        courseClassesData[item.courseId].map(cls => {
                                                                            let parsed: any = {};
                                                                            try {
                                                                                parsed = JSON.parse(cls.detail || '{}');
                                                                            } catch { }

                                                                            return (
                                                                                <tr key={cls.id}>
                                                                                    <td>{parsed.ma_lop || cls.id}</td>
                                                                                    <td>
                                                                                        {(() => {
                                                                                            if (Array.isArray(parsed)) {
                                                                                                return parsed.map((s: any, idx: number) => (
                                                                                                    <div key={idx}>
                                                                                                        {s.day?.replace('T', 'Thứ ')} - Tiết {Array.isArray(s.periods) ? s.periods.join(', ') : s.period}
                                                                                                    </div>
                                                                                                ));
                                                                                            } else if (parsed.slots && Array.isArray(parsed.slots)) {
                                                                                                return parsed.slots.map((s: any, idx: number) => (
                                                                                                    <div key={idx}>
                                                                                                        {s.day?.replace('T', 'Thứ ')} - Tiết {Array.isArray(s.periods) ? s.periods.join(', ') : s.period}
                                                                                                    </div>
                                                                                                ));
                                                                                            } else if (parsed.thu && parsed.tiet_bd && parsed.tiet_kt) {
                                                                                                return (
                                                                                                    <div>
                                                                                                        Thứ {parsed.thu} - Tiết {parsed.tiet_bd}-{parsed.tiet_kt} {parsed.phong_hoc ? `(${parsed.phong_hoc})` : ''}
                                                                                                    </div>
                                                                                                );
                                                                                            }
                                                                                            return cls.detail;
                                                                                        })()}
                                                                                    </td>
                                                                                    <td>
                                                                                        <span className={`table-status status-${cls.occupiedSlots >= cls.totalSlots ? 'blocked' : 'available'}`}>
                                                                                            {cls.occupiedSlots}/{cls.totalSlots}
                                                                                        </span>
                                                                                    </td>
                                                                                    {currentRegPeriodType === 'register_class' && (
                                                                                        <td>
                                                                                            <button
                                                                                                className="primary-btn"
                                                                                                onClick={() => handleRegisterClassSection(cls.id, item.code)}
                                                                                                disabled={isSubmitting || cls.occupiedSlots >= cls.totalSlots}
                                                                                                style={{ padding: '4px 12px', fontSize: '0.85rem' }}
                                                                                            >
                                                                                                Đăng ký
                                                                                            </button>
                                                                                        </td>
                                                                                    )}
                                                                                </tr>
                                                                            );
                                                                        })
                                                                    ) : (
                                                                        <tr>
                                                                            <td colSpan={currentRegPeriodType === 'register_class' ? 4 : 3} className="empty-table-cell">
                                                                                Không có lớp học phần nào đang mở cho học phần này
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                                {displayedSubjects.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="empty-table-cell">
                                            Chưa có học phần đăng ký
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <div className="table-footer" style={{ marginTop: '16px', padding: '12px', background: 'var(--surface-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <div className="credits-info" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <span className="total-credits" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Tổng số TC: {totalCredits}</span>
                                <span className="credits-note" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>* Ghi chú: {statusNote}</span>
                            </div>
                        </div>
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
            </main>
        </div>
    );
};
