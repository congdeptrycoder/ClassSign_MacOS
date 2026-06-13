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
        ky: classData.ky,
        truong_khoa: classData.khoa_truong,
        ma_hp: classData.ma_hp,
        ten_hp: classData.ten_hp,
        ma_lop: classData.ma_lop,
        ma_lop_kem: classData.ma_lop_kem,
        ghi_chu: classData.ghi_chu,
        thu: classData.thu,
        tiet_bd: classData.tiet_bd,
        tiet_kt: classData.tiet_kt,
        buoi: classData.buoi,
        phong_hoc: classData.phong_hoc,
        can_tn: classData.can_tn,
        sl_max: classData.sl_max,
        teaching_type: classData.teaching_type,
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
                            <input type="text" value={formData.ky} disabled style={{ width: '100%', padding: '8px', boxSizing: 'border-box', backgroundColor: '#e9ecef', cursor: 'not-allowed', marginTop: '5px' }} />
                        </div>
                        <div>
                            <label>Trường/Khoa:</label>
                            <input type="text" value={formData.truong_khoa} disabled style={{ width: '100%', padding: '8px', boxSizing: 'border-box', backgroundColor: '#e9ecef', cursor: 'not-allowed', marginTop: '5px' }} />
                        </div>
                        <div>
                            <label>Mã Học Phần:</label>
                            <input type="text" value={formData.ma_hp} disabled style={{ width: '100%', padding: '8px', boxSizing: 'border-box', backgroundColor: '#e9ecef', cursor: 'not-allowed', marginTop: '5px' }} />
                        </div>
                        <div>
                            <label>Tên Học Phần:</label>
                            <input type="text" value={formData.ten_hp} disabled style={{ width: '100%', padding: '8px', boxSizing: 'border-box', backgroundColor: '#e9ecef', cursor: 'not-allowed', marginTop: '5px' }} />
                        </div>

                        {/* Editable fields */}
                        <div>
                            <label>Mã lớp: <span style={{ color: 'red' }}>*</span></label>
                            <input type="text" value={formData.ma_lop} onChange={e => handleChange('ma_lop', e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '5px' }} />
                        </div>
                        <div>
                            <label>Mã lớp kèm:</label>
                            <input type="text" value={formData.ma_lop_kem} onChange={e => handleChange('ma_lop_kem', e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '5px' }} />
                        </div>
                        <div>
                            <label>Ghi chú:</label>
                            <input type="text" value={formData.ghi_chu} onChange={e => handleChange('ghi_chu', e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '5px' }} />
                        </div>
                        <div>
                            <label>Thứ: <span style={{ color: 'red' }}>*</span></label>
                            <input type="text" value={formData.thu} onChange={e => handleChange('thu', e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '5px' }} />
                        </div>
                        <div>
                            <label>Tiết Bắt Đầu: <span style={{ color: 'red' }}>*</span></label>
                            <input type="text" value={formData.tiet_bd} onChange={e => handleChange('tiet_bd', e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '5px' }} />
                        </div>
                        <div>
                            <label>Tiết Kết Thúc: <span style={{ color: 'red' }}>*</span></label>
                            <input type="text" value={formData.tiet_kt} onChange={e => handleChange('tiet_kt', e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '5px' }} />
                        </div>
                        <div>
                            <label>Buổi: <span style={{ color: 'red' }}>*</span></label>
                            <select value={formData.buoi} onChange={e => handleChange('buoi', e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '5px' }}>
                                <option value="Sáng">Sáng</option>
                                <option value="Chiều">Chiều</option>
                            </select>
                        </div>
                        <div>
                            <label>Phòng học: <span style={{ color: 'red' }}>*</span></label>
                            <input type="text" value={formData.phong_hoc} onChange={e => handleChange('phong_hoc', e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '5px' }} />
                        </div>
                        <div>
                            <label>Cần TN:</label>
                            <input type="text" value={formData.can_tn} onChange={e => handleChange('can_tn', e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '5px' }} />
                        </div>
                        <div>
                            <label>SL Max: <span style={{ color: 'red' }}>*</span></label>
                            <input type="text" value={formData.sl_max} onChange={e => handleChange('sl_max', e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '5px' }} />
                        </div>
                        <div>
                            <label>Teaching Type:</label>
                            <input type="text" value={formData.teaching_type} onChange={e => handleChange('teaching_type', e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '5px' }} />
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
