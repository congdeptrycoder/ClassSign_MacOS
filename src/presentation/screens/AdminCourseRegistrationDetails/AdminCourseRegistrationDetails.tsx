import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdminCourseRegistrationDetailsViewModel } from '../../../interface-adapters/viewmodels/AdminCourseRegistrationDetails/useAdminCourseRegistrationDetailsViewModel';
import { useTheme } from '../../components/ThemeContext';
import hustLogo from '../../../../public/images/hust-logo.png';
import '../AdminDashboard/AdminDashboard.css';

export const AdminCourseRegistrationDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();

    const semester = location.state?.semester as number || null;
    const semesterString = location.state?.semesterString as string || semester;

    const {
        stats,
        loading,
        error,
        filterMaHp,
        setFilterMaHp,
        filterTenHp,
        setFilterTenHp,
        filterTruongKhoa,
        setFilterTruongKhoa,
        filterSoLuong,
        setFilterSoLuong,
        expandedCourseId,
        courseClasses,
        loadingClasses,
        toggleExpandCourse,
        handleDeleteClass
    } = useAdminCourseRegistrationDetailsViewModel(semester);

    const handleBack = () => {
        navigate(-1);
    };

    const handleEditClass = (cls: any, stat: any) => {
        const classData = {
            id: cls.id,
            ky: semesterString,
            khoa_truong: stat.truong_khoa,
            ma_hp: stat.ma_hp,
            ten_hp: stat.ten_hp,
            ma_lop: cls.ma_lop,
            ma_lop_kem: cls.ma_lop_kem !== 'NULL' ? cls.ma_lop_kem : '',
            ghi_chu: cls.ghi_chu !== 'NULL' ? cls.ghi_chu : '',
            thu: cls.thu,
            tiet_bd: cls.tiet_bd,
            tiet_kt: cls.tiet_kt,
            buoi: cls.buoi,
            phong_hoc: cls.phong_hoc,
            can_tn: cls.can_tn !== 'NULL' ? cls.can_tn : '',
            sl_max: cls.sl_max,
            sl_dk: cls.sl_dk,
            teaching_type: cls.teaching_type !== 'NULL' ? cls.teaching_type : ''
        };
        navigate('/admin/edit', { state: { classData } });
    };

    return (
        <div className="admin-container">
            <header className="nav-bar">
                <div className="nav-left">
                    <img src={hustLogo} alt="Logo" className="nav-logo" />
                    <span className="nav-title">Chi tiết Đăng ký Học phần</span>
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
                    <h3 style={{ margin: 0 }}>
                        Kỳ học: {semesterString || 'Không xác định'}
                    </h3>
                    <button className="delete-btn" onClick={handleBack}>
                        Quay lại
                    </button>
                </section>

                <section className="table-wrapper card">
                    {loading && <p>Đang tải dữ liệu...</p>}
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    {!loading && !error && (
                        <div className="table-scroll">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>
                                            <div>Mã HP</div>
                                            <input 
                                                type="text" 
                                                placeholder="Lọc..." 
                                                value={filterMaHp} 
                                                onChange={e => setFilterMaHp(e.target.value)} 
                                                style={{ width: '100%', marginTop: '5px', padding: '4px', boxSizing: 'border-box' }}
                                            />
                                        </th>
                                        <th>
                                            <div>Tên HP</div>
                                            <input 
                                                type="text" 
                                                placeholder="Lọc..." 
                                                value={filterTenHp} 
                                                onChange={e => setFilterTenHp(e.target.value)} 
                                                style={{ width: '100%', marginTop: '5px', padding: '4px', boxSizing: 'border-box' }}
                                            />
                                        </th>
                                        <th>
                                            <div>Trường/Khoa</div>
                                            <input 
                                                type="text" 
                                                placeholder="Lọc..." 
                                                value={filterTruongKhoa} 
                                                onChange={e => setFilterTruongKhoa(e.target.value)} 
                                                style={{ width: '100%', marginTop: '5px', padding: '4px', boxSizing: 'border-box' }}
                                            />
                                        </th>
                                        <th>
                                            <div>Số lượng đăng ký</div>
                                            <input 
                                                type="text" 
                                                placeholder="Lọc..." 
                                                value={filterSoLuong} 
                                                onChange={e => setFilterSoLuong(e.target.value)} 
                                                style={{ width: '100%', marginTop: '5px', padding: '4px', boxSizing: 'border-box' }}
                                            />
                                        </th>
                                        <th>Số lượng lớp</th>
                                        <th>Số lượng ĐK tối đa</th>
                                        <th>Trạng thái</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.map((stat, idx) => {
                                        let trangThai = "Đã đáp ứng đủ";
                                        if (stat.so_luong_lop === 0) {
                                            trangThai = "Chưa có lớp";
                                        } else if (stat.so_luong_dk_toi_da < stat.so_luong_dang_ky) {
                                            trangThai = "Chưa phục vụ đủ sinh viên";
                                        }

                                        return (
                                            <React.Fragment key={idx}>
                                                <tr>
                                                    <td>{stat.ma_hp}</td>
                                                <td>{stat.ten_hp}</td>
                                                <td>{stat.truong_khoa}</td>
                                                <td>{stat.so_luong_dang_ky}</td>
                                                <td>{stat.so_luong_lop}</td>
                                                <td>{stat.so_luong_dk_toi_da}</td>
                                                <td>
                                                    <span style={{
                                                        color: trangThai === "Đã đáp ứng đủ" ? 'green' : '#ff4d4f',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {trangThai}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="primary-btn" style={{ marginRight: '5px', fontSize: '12px', padding: '5px 10px' }} onClick={() => navigate('/admin/create-class', {
                                                        state: {
                                                            ky: semesterString,
                                                            truong_khoa: stat.truong_khoa,
                                                            ma_hp: stat.ma_hp,
                                                            ten_hp: stat.ten_hp
                                                        }
                                                    })}>Mở lớp</button>
                                                    <button className="secondary-btn" style={{ fontSize: '12px', padding: '5px 10px' }} onClick={() => toggleExpandCourse(stat.course_id, semester!)}>
                                                        {expandedCourseId === stat.course_id ? 'Đóng danh sách' : 'Xem danh sách lớp'}
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedCourseId === stat.course_id && (
                                                <tr key={`expanded-${stat.course_id}`} style={{ backgroundColor: '#f9f9f9' }}>
                                                    <td colSpan={8} style={{ padding: '20px' }}>
                                                        {loadingClasses && !courseClasses[stat.course_id] ? (
                                                            <p>Đang tải danh sách lớp...</p>
                                                        ) : (courseClasses[stat.course_id] || []).length === 0 ? (
                                                            <p style={{ textAlign: 'center', fontStyle: 'italic', margin: 0 }}>Chưa có lớp học nào</p>
                                                        ) : (
                                                            <table className="admin-table" style={{ margin: 0 }}>
                                                                <thead>
                                                                    <tr>
                                                                        <th>Mã lớp</th>
                                                                        <th>Mã lớp kèm</th>
                                                                        <th>Ghi chú</th>
                                                                        <th>Thứ</th>
                                                                        <th>Tiết BĐ</th>
                                                                        <th>Tiết KT</th>
                                                                        <th>Buổi</th>
                                                                        <th>Phòng học</th>
                                                                        <th>Cần TN</th>
                                                                        <th>SL ĐK</th>
                                                                        <th>SL Max</th>
                                                                        <th>Loại</th>
                                                                        <th>Hành động</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {(courseClasses[stat.course_id] || []).map((cls, cIdx) => (
                                                                        <tr key={cIdx}>
                                                                            <td>{cls.ma_lop}</td>
                                                                            <td>{cls.ma_lop_kem !== 'NULL' ? cls.ma_lop_kem : ''}</td>
                                                                            <td>{cls.ghi_chu !== 'NULL' ? cls.ghi_chu : ''}</td>
                                                                            <td>{cls.thu !== 'NULL' && cls.thu !== undefined ? cls.thu : ''}</td>
                                                                            <td>{cls.tiet_bd}</td>
                                                                            <td>{cls.tiet_kt}</td>
                                                                            <td>{cls.buoi}</td>
                                                                            <td>{cls.phong_hoc}</td>
                                                                            <td>{cls.can_tn !== 'NULL' ? cls.can_tn : ''}</td>
                                                                            <td>{cls.sl_dk}</td>
                                                                            <td>{cls.sl_max}</td>
                                                                            <td>{cls.teaching_type !== 'NULL' ? cls.teaching_type : ''}</td>
                                                                            <td>
                                                                                <div className="action-cell">
                                                                                    <button className="edit-btn" style={{ fontSize: '10px', padding: '3px 6px' }} onClick={() => handleEditClass(cls, stat)}>Sửa</button>
                                                                                    <button className="delete-btn" style={{ fontSize: '10px', padding: '3px 6px' }} onClick={() => handleDeleteClass(cls.id, stat.course_id, semester!)}>Xoá</button>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                                {stats.length === 0 && (
                                        <tr>
                                            <td colSpan={8} style={{ textAlign: 'center' }}>Không có dữ liệu phù hợp</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};
