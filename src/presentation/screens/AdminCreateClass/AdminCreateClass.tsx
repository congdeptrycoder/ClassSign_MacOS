import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdminCreateClassViewModel } from '../../../interface-adapters/viewmodels/AdminCreateClass/useAdminCreateClassViewModel';
import { useTheme } from '../../components/ThemeContext';
import hustLogo from '../../../../public/images/hust-logo.png';
import '../AdminDashboard/AdminDashboard.css';

export const AdminCreateClass = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();

    const classData = location.state?.classData;
    const isEdit = !!classData;

    const initialState = isEdit ? {
        id: classData.id,
        semester: classData.semester,
        departmentName: classData.departmentName,
        courseCode: classData.courseCode,
        courseName: classData.courseName,
        classCode: classData.classCode,
        subClassCode: classData.subClassCode,
        notes: classData.notes,
        dayOfWeek: classData.dayOfWeek,
        startPeriod: classData.startPeriod,
        endPeriod: classData.endPeriod,
        daySession: classData.daySession,
        room: classData.room,
        requiresExperiment: classData.requiresExperiment,
        maxSlots: classData.maxSlots,
        teachingType: classData.teachingType,
    } : (location.state || {});

    const onNavigateBack = () => {
        navigate(-1);
    };

    const { formData, handleChange, handleSave } = useAdminCreateClassViewModel(
        initialState,
        onNavigateBack,
        isEdit
    );

    return (
        <div className="admin-container">
            <header className="nav-bar">
                <div className="nav-left">
                    <img src={hustLogo} alt="Logo" className="nav-logo" />
                    <span className="nav-title">{isEdit ? 'Chỉnh sửa Lớp Học' : 'Tạo Lớp Học Mới'}</span>
                </div>
                <div className="nav-right">
                    <button className="icon-btn" onClick={toggleTheme}>
                        {isDark ? '☀️' : '🌙'}
                    </button>
                    <div className="profile-trigger">
                        <img src={hustLogo} alt="Avatar" className="avatar" />
                    </div>
                </div>
            </header>

            <main className="admin-content">
                <section className="card" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>{isEdit ? 'Cập nhật thông tin lớp học' : 'Nhập thông tin lớp học'}</h3>
                    <button className="delete-btn" onClick={onNavigateBack}>Quay lại</button>
                </section>

                <section className="card">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label>Kỳ học:</label>
                            <input type="text" value={formData.semester} disabled style={{ width: '100%', padding: '8px', boxSizing: 'border-box', backgroundColor: '#e9ecef', cursor: 'not-allowed', marginTop: '5px' }} />
                        </div>
                        <div>
                            <label>Trường/Khoa:</label>
                            <input type="text" value={formData.departmentName} disabled style={{ width: '100%', padding: '8px', boxSizing: 'border-box', backgroundColor: '#e9ecef', cursor: 'not-allowed', marginTop: '5px' }} />
                        </div>
                        <div>
                            <label>Mã Học Phần:</label>
                            <input type="text" value={formData.courseCode} disabled style={{ width: '100%', padding: '8px', boxSizing: 'border-box', backgroundColor: '#e9ecef', cursor: 'not-allowed', marginTop: '5px' }} />
                        </div>
                        <div>
                            <label>Tên Học Phần:</label>
                            <input type="text" value={formData.courseName} disabled style={{ width: '100%', padding: '8px', boxSizing: 'border-box', backgroundColor: '#e9ecef', cursor: 'not-allowed', marginTop: '5px' }} />
                        </div>

                        {/* Editable fields */}
                        <div>
                            <label>Mã lớp: <span style={{ color: 'red' }}>*</span></label>
                            <input type="text" value={formData.classCode} onChange={e => handleChange('classCode', e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '5px' }} />
                        </div>
                        <div>
                            <label>Mã lớp kèm:</label>
                            <input type="text" value={formData.subClassCode} onChange={e => handleChange('subClassCode', e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '5px' }} />
                        </div>
                        <div>
                            <label>Ghi chú:</label>
                            <input type="text" value={formData.notes} onChange={e => handleChange('notes', e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '5px' }} />
                        </div>
                        <div>
                            <label>Thứ: <span style={{ color: 'red' }}>*</span></label>
                            <input type="text" value={formData.dayOfWeek} onChange={e => handleChange('dayOfWeek', e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '5px' }} />
                        </div>
                        <div>
                            <label>Tiết Bắt Đầu: <span style={{ color: 'red' }}>*</span></label>
                            <input type="text" value={formData.startPeriod} onChange={e => handleChange('startPeriod', e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '5px' }} />
                        </div>
                        <div>
                            <label>Tiết Kết Thúc: <span style={{ color: 'red' }}>*</span></label>
                            <input type="text" value={formData.endPeriod} onChange={e => handleChange('endPeriod', e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '5px' }} />
                        </div>
                        <div>
                            <label>Buổi: <span style={{ color: 'red' }}>*</span></label>
                            <select value={formData.daySession} onChange={e => handleChange('daySession', e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '5px' }}>
                                <option value="Sáng">Sáng</option>
                                <option value="Chiều">Chiều</option>
                            </select>
                        </div>
                        <div>
                            <label>Phòng học: <span style={{ color: 'red' }}>*</span></label>
                            <input type="text" value={formData.room} onChange={e => handleChange('room', e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '5px' }} />
                        </div>
                        <div>
                            <label>Cần TN:</label>
                            <input type="text" value={formData.requiresExperiment} onChange={e => handleChange('requiresExperiment', e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '5px' }} />
                        </div>
                        <div>
                            <label>SL Max: <span style={{ color: 'red' }}>*</span></label>
                            <input type="text" value={formData.maxSlots} onChange={e => handleChange('maxSlots', e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '5px' }} />
                        </div>
                        <div>
                            <label>Teaching Type:</label>
                            <input type="text" value={formData.teachingType} onChange={e => handleChange('teachingType', e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '5px' }} />
                        </div>
                    </div>
                    
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button className="delete-btn" onClick={onNavigateBack}>Huỷ</button>
                        <button className="primary-btn" onClick={handleSave}>Lưu thông tin</button>
                    </div>
                </section>
            </main>
        </div>
    );
};
