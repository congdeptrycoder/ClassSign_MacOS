import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ClassInfo,
    useAdminDashboardViewModel,
} from '../../../interface-adapters/viewmodels/AdminDashboard/useAdminDashboardViewModel';
import { useTheme } from '../../components/ThemeContext';
import { getCurrentAccount } from '../../../shared/session/currentUserSession';
import hustLogo from '../../../../public/images/hust-logo.png';
import './AdminDashboard.css';

const tableHeaders: { label: string, key: keyof ClassInfo | 'action' }[] = [
    { label: 'Trường/Khoa', key: 'departmentName' },
    { label: 'Mã lớp', key: 'classCode' },
    { label: 'Mã lớp kèm', key: 'subClassCode' },
    { label: 'Mã HP', key: 'courseCode' },
    { label: 'Tên HP', key: 'courseName' },
    { label: 'Ghi chú', key: 'notes' },
    { label: 'Thứ', key: 'dayOfWeek' },
    { label: 'Tiết BD', key: 'startPeriod' },
    { label: 'Tiết KT', key: 'endPeriod' },
    { label: 'Buổi', key: 'daySession' },
    { label: 'Phòng học', key: 'room' },
    { label: 'Cần TN', key: 'requiresExperiment' },
    { label: 'SLDK', key: 'occupiedSlots' },
    { label: 'SL Max', key: 'maxSlots' },
    { label: 'TeachingType', key: 'teachingType' },
    { label: 'Hành động', key: 'action' },
];

export const AdminDashboard = () => {
    const navigate = useNavigate();
    const onLogout = () => navigate('/login');
    const onNavigateToEdit = (item: ClassInfo) => navigate('/admin/edit', { state: { classData: item } });

    const {
        isProfileOpen,
        toggleProfile,
        handleLogout,
        handleUpload,
        filters,
        handleFilterChange,
        classesData,
        filteredClassesData,
        handleEdit,
        handleDelete,
        // Registration Period
        regPeriodType,
        setRegPeriodType,
        regPeriodStart,
        setRegPeriodStart,
        regPeriodEnd,
        setRegPeriodEnd,
        selectedSemester,
        setSelectedSemester,
        semestersData,
        periodsData,
        handleSaveRegistrationPeriod,
        isEditingPeriod,
        setIsEditingPeriod,
        editPeriodId,
        setEditPeriodId,
        handleEditRegistrationPeriod,
        handleDeleteRegistrationPeriod,
        selectedClassSemesterId,
        setSelectedClassSemesterId,
        isCreateSemesterModalOpen,
        setCreateSemesterModalOpen,
        newSemesterCode,
        setNewSemesterCode,
        handleCreateSemester,
    } = useAdminDashboardViewModel(onNavigateToEdit, onLogout);

    const { isDark, toggleTheme } = useTheme();

    const account = getCurrentAccount();
    const displayName = account ? `${account.name} - ${account.id_card}` : 'Unknown User';

    return (
        <div className="admin-container">
            <header className="nav-bar">
                <div className="nav-left">
                    <img src={hustLogo} alt="Logo" className="nav-logo" />
                    <span className="nav-title">Quản trị hệ thống</span>
                </div>
                <div className="nav-right">
                    <button className="icon-btn" onClick={toggleTheme}>
                        {isDark ? '☀️' : '🌙'}
                    </button>
                    <div className="profile-trigger" onClick={toggleProfile}>
                        <img src={hustLogo} alt="Avatar" className="avatar" />
                    </div>
                </div>
            </header>

            {isProfileOpen && (
                <div className="user-profile-popover card">
                    <p className="user-name">{displayName}</p>
                    <button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
                </div>
            )}

            <main className="admin-content">
                <section className="registration-setup card" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>Quản lý Giai đoạn đăng ký</h3>
                        {!isEditingPeriod && (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="primary-btn" onClick={() => setCreateSemesterModalOpen(true)} style={{ backgroundColor: '#28a745' }}>Thêm kỳ mới</button>
                                <button className="primary-btn" onClick={() => handleEditRegistrationPeriod()}>Thêm đợt đăng ký mới</button>
                            </div>
                        )}
                    </div>

                    {isEditingPeriod && (
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <label>Kỳ học:</label>
                                <select
                                    value={selectedSemester}
                                    onChange={(e) => setSelectedSemester(Number(e.target.value))}
                                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    {semestersData.map(sem => (
                                        <option key={sem.id} value={sem.id}>{sem.semester}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <label>Loại đăng ký:</label>
                                <select
                                    value={regPeriodType}
                                    onChange={(e) => setRegPeriodType(e.target.value as 'register_program' | 'register_class')}
                                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    <option value="register_program">Đăng ký Học phần</option>
                                    <option value="register_class">Đăng ký Lớp học</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <label>Từ:</label>
                                <input
                                    type="datetime-local"
                                    value={regPeriodStart}
                                    onChange={(e) => setRegPeriodStart(e.target.value)}
                                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <label>Đến:</label>
                                <input
                                    type="datetime-local"
                                    value={regPeriodEnd}
                                    onChange={(e) => setRegPeriodEnd(e.target.value)}
                                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            </div>
                            <button className="primary-btn" onClick={handleSaveRegistrationPeriod}>{editPeriodId ? 'Cập nhật' : 'Lưu'}</button>
                            <button className="delete-btn" onClick={() => handleEditRegistrationPeriod()}>Huỷ</button>
                        </div>
                    )}

                    {periodsData.length > 0 ? (
                        <table className="info-table" style={{ width: '100%', marginTop: '10px' }}>
                            <thead>
                                <tr>
                                    <th>Kỳ học</th>
                                    <th>Loại đăng ký</th>
                                    <th>Từ ngày</th>
                                    <th>Đến ngày</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {periodsData.map((period) => (
                                    <tr key={period.id}>
                                        <td>{period.semester_name || period.semester}</td>
                                        <td>{period.period_type === 'register_program' ? 'Đăng ký Học phần' : 'Đăng ký Lớp học'}</td>
                                        <td>{new Date(period.start_date).toLocaleString('vi-VN')}</td>
                                        <td>{new Date(period.end_date).toLocaleString('vi-VN')}</td>
                                        <td className="status-cell" style={{ fontWeight: 'bold', color: period.is_active === 1 ? '#4CAF50' : '#f44336' }}>
                                            {period.is_active === 1 ? 'ĐANG DIỄN RA' : 'ĐÃ KẾT THÚC'}
                                        </td>
                                        <td>
                                            <button className="detail-btn" onClick={() => navigate('/admin/program-registration-details', { state: { semester: period.semester, semesterString: semestersData.find(s => s.id === period.semester)?.semester } })} style={{ marginRight: '8px' }}>Xem chi tiết</button>
                                            <button className="edit-btn-yellow" onClick={() => handleEditRegistrationPeriod(period as any)} style={{ marginRight: '8px' }}>Sửa</button>
                                            <button className="delete-btn" onClick={() => handleDeleteRegistrationPeriod(period.id)}>Xoá</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ textAlign: 'center', color: '#666' }}>Chưa có đợt đăng ký nào được thiết lập.</p>
                    )}
                </section>

                <section className="action-bar card" style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <h3 style={{ margin: 0 }}>Quản lý danh sách lớp học</h3>
                        <select
                            value={selectedClassSemesterId}
                            onChange={(e) => setSelectedClassSemesterId(Number(e.target.value))}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                        >
                            {semestersData.map(sem => (
                                <option key={sem.id} value={sem.id}>{sem.semester}</option>
                            ))}
                        </select>
                    </div>


                </section>

                <section className="table-wrapper card">
                    <div className="table-scroll">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    {tableHeaders.map((header, idx) => (
                                        <th key={idx}>
                                            <div>{header.label}</div>
                                            {header.key !== 'action' && (
                                                <input
                                                    type="text"
                                                    placeholder="Lọc..."
                                                    value={filters[header.key as keyof ClassInfo] || ''}
                                                    onChange={e => handleFilterChange(header.key as keyof ClassInfo, e.target.value)}
                                                    style={{ width: '100%', marginTop: '5px', padding: '4px', boxSizing: 'border-box' }}
                                                />
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClassesData.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.departmentName}</td>
                                        <td>{item.classCode}</td>
                                        <td>{item.subClassCode}</td>
                                        <td>{item.courseCode}</td>
                                        <td>{item.courseName}</td>
                                        <td>{item.notes}</td>
                                        <td>{item.dayOfWeek}</td>
                                        <td>{item.startPeriod}</td>
                                        <td>{item.endPeriod}</td>
                                        <td>{item.daySession}</td>
                                        <td>{item.room}</td>
                                        <td>{item.requiresExperiment}</td>
                                        <td>{item.occupiedSlots}</td>
                                        <td>{item.maxSlots}</td>
                                        <td>{item.teachingType}</td>
                                        <td>
                                            <div className="action-cell">
                                                <button className="edit-btn" onClick={() => handleEdit(item)}>Sửa</button>
                                                <button className="delete-btn" onClick={() => handleDelete(item)}>Xoá</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            {isCreateSemesterModalOpen && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ padding: '20px', minWidth: '300px', backgroundColor: '#fff', borderRadius: '8px' }}>
                        <h3 style={{ marginTop: 0, textAlign: 'center' }}>Thêm Kỳ Mới</h3>
                        <input
                            type="text"
                            placeholder="Nhập mã kỳ (VD: 20261)"
                            value={newSemesterCode}
                            onChange={e => setNewSemesterCode(e.target.value)}
                            style={{ width: '100%', padding: '10px', marginBottom: '20px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button className="delete-btn" onClick={() => setCreateSemesterModalOpen(false)}>Hủy</button>
                            <button className="primary-btn" onClick={handleCreateSemester} style={{ backgroundColor: '#28a745' }}>Lưu</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
