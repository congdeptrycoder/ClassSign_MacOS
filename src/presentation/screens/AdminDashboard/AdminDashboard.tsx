import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ClassInfo,
    useAdminDashboardViewModel,
} from '../../../interface-adapters/viewmodels/AdminDashboard/useAdminDashboardViewModel';
import { useTheme } from '../../components/ThemeContext';
import hustLogo from '../../../../public/images/hust-logo.png';
import './AdminDashboard.css';

const tableHeaders = [
    'Kỳ', 'Trường/Khoa', 'Mã lớp', 'Mã lớp kèm', 'Mã HP', 'Tên HP',
    'Khối lượng', 'Ghi chú', 'Tiết BD', 'Tiết KT', 'Buổi', 'Phòng học',
    'Cần TN', 'SLDK', 'SL Max', 'Trạng thái', 'TeachingType', 'Hành động',
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
        searchQuery,
        setSearchQuery,
        searchMode,
        setSearchMode,
        department,
        major,
        setMajor,
        handleSearch,
        classesData,
        handleEdit,
        handleDelete,
        isModeModalOpen,
        setModeModalOpen,
        isDeptModalOpen,
        setDeptModalOpen,
        isMajorModalOpen,
        setMajorModalOpen,
        searchModeOptions,
        departmentOptions,
        majorOptions,
        handleSelectDepartment,
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
        handleDeleteRegistrationPeriod,
    } = useAdminDashboardViewModel(onNavigateToEdit, onLogout);

    const { isDark, toggleTheme } = useTheme();

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
                    <p className="user-name">Nguyễn Tuấn Anh - PDT3636</p>
                    <button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
                </div>
            )}

            <main className="admin-content">
                <section className="registration-setup card" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>Quản lý Giai đoạn đăng ký</h3>
                        {!isEditingPeriod && (
                            <button className="primary-btn" onClick={() => setIsEditingPeriod(true)}>Thêm đợt đăng ký mới</button>
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
                            <button className="primary-btn" onClick={handleSaveRegistrationPeriod}>Lưu</button>
                            <button className="delete-btn" onClick={() => setIsEditingPeriod(false)}>Huỷ</button>
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

                <section className="action-bar card">
                    <div className="upload-section">
                        <button className="primary-btn" onClick={handleUpload}>Upload file</button>
                        <span className="hint-text">* chỉ up file .xlsx</span>
                    </div>

                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Nhập thông tin tìm kiếm..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        <div className="dropdown-row">
                            <button className="dropdown-btn" onClick={() => setModeModalOpen(true)}>
                                Tìm theo: {searchMode}
                            </button>
                            <button className="dropdown-btn" onClick={() => setDeptModalOpen(true)}>
                                Khoa/Trường: {department || 'Chọn'}
                            </button>
                            <button className="dropdown-btn" onClick={() => setMajorModalOpen(true)}>
                                Ngành: {major || 'Chọn'}
                            </button>
                        </div>
                        <button className="search-btn" onClick={handleSearch}>Tìm kiếm</button>
                    </div>
                </section>

                <section className="table-wrapper card">
                    <div className="table-scroll">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    {tableHeaders.map((header, idx) => (
                                        <th key={idx}>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {classesData.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.ky}</td>
                                        <td>{item.khoa_truong}</td>
                                        <td>{item.ma_lop}</td>
                                        <td>{item.ma_lop_kem}</td>
                                        <td>{item.ma_hp}</td>
                                        <td>{item.ten_hp}</td>
                                        <td>{item.khoi_luong}</td>
                                        <td>{item.ghi_chu}</td>
                                        <td>{item.tiet_bd}</td>
                                        <td>{item.tiet_kt}</td>
                                        <td>{item.buoi}</td>
                                        <td>{item.phong_hoc}</td>
                                        <td>{item.can_tn}</td>
                                        <td>{item.sl_dk}</td>
                                        <td>{item.sl_max}</td>
                                        <td>{item.trang_thai}</td>
                                        <td>{item.teaching_type}</td>
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

            {/* Modals */}
            {isModeModalOpen && (
                <div className="modal-overlay" onClick={() => setModeModalOpen(false)}>
                    <div className="modal-content card" onClick={e => e.stopPropagation()}>
                        <h3>Chọn chế độ tìm kiếm</h3>
                        <div className="modal-list">
                            {searchModeOptions.map(opt => (
                                <button key={opt} onClick={() => { setSearchMode(opt); setModeModalOpen(false); }}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {isDeptModalOpen && (
                <div className="modal-overlay" onClick={() => setDeptModalOpen(false)}>
                    <div className="modal-content card" onClick={e => e.stopPropagation()}>
                        <h3>Chọn Khoa/Trường</h3>
                        <div className="modal-list">
                            {departmentOptions.map(opt => (
                                <button key={opt} onClick={() => handleSelectDepartment(opt)}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {isMajorModalOpen && (
                <div className="modal-overlay" onClick={() => setMajorModalOpen(false)}>
                    <div className="modal-content card" onClick={e => e.stopPropagation()}>
                        <h3>Chọn Ngành</h3>
                        <div className="modal-list">
                            {majorOptions.map(opt => (
                                <button key={opt} onClick={() => { setMajor(opt); setMajorModalOpen(false); }}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
