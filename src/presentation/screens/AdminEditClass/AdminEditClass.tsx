import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ClassInfo } from '../../../interface-adapters/viewmodels/AdminDashboard/useAdminDashboardViewModel';
import { useAdminEditClassViewModel } from '../../../interface-adapters/viewmodels/AdminEditClass/useAdminEditClassViewModel';
import { useTheme } from '../../components/ThemeContext';
import './AdminEditClass.css';

const fields: Array<{ key: keyof ClassInfo; label: string }> = [
    { key: 'ky', label: 'Kỳ' },
    { key: 'khoa_truong', label: 'Trường/Khoa' },
    { key: 'ma_lop', label: 'Mã lớp' },
    { key: 'ma_lop_kem', label: 'Mã lớp kèm' },
    { key: 'ma_hp', label: 'Mã học phần' },
    { key: 'ten_hp', label: 'Tên học phần' },
    { key: 'khoi_luong', label: 'Khối lượng' },
    { key: 'ghi_chu', label: 'Ghi chú' },
    { key: 'tiet_bd', label: 'Tiết bắt đầu' },
    { key: 'tiet_kt', label: 'Tiết kết thúc' },
    { key: 'buoi', label: 'Buổi' },
    { key: 'phong_hoc', label: 'Phòng học' },
    { key: 'can_tn', label: 'Cần thí nghiệm' },
    { key: 'sl_dk', label: 'Số lượng đăng ký' },
    { key: 'sl_max', label: 'Số lượng tối đa' },
    { key: 'trang_thai', label: 'Trạng thái' },
    { key: 'teaching_type', label: 'Teaching Type' },
];

export const AdminEditClass = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const initialData = (location.state as any)?.classData as ClassInfo;

    const onGoBack = () => navigate('/admin');

    const { formValues, handleInputChange, handleSave, handleGoBack } =
        useAdminEditClassViewModel(onGoBack, initialData);

    const { toggleTheme, isDark } = useTheme();

    return (
        <div className="edit-container">
            <header className="edit-header">
                <div className="header-left">
                    <button className="back-btn" onClick={handleGoBack}>
                        &larr; Quay lại
                    </button>
                    <h1 className="header-title">Chỉnh sửa thông tin lớp học</h1>
                </div>
                <button className="icon-btn" onClick={toggleTheme}>
                    {isDark ? '☀️' : '🌙'}
                </button>
            </header>

            <main className="edit-content">
                <div className="edit-card card">
                    <div className="grid-form">
                        {fields.map(field => (
                            <div key={field.key} className="input-group">
                                <label className="label">{field.label}</label>
                                <input
                                    className="input"
                                    value={formValues[field.key]}
                                    onChange={e => handleInputChange(field.key, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="form-actions">
                        <button className="save-btn primary-btn" onClick={handleSave}>
                            Lưu thay đổi
                        </button>
                        <button className="cancel-btn" onClick={handleGoBack}>
                            Huỷ bỏ
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};
