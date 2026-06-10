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
        setFilterSoLuong
    } = useAdminCourseRegistrationDetailsViewModel(semester);

    const handleBack = () => {
        navigate(-1);
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
                        Kỳ học: {semester || 'Không xác định'}
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.map((stat, idx) => (
                                        <tr key={idx}>
                                            <td>{stat.ma_hp}</td>
                                            <td>{stat.ten_hp}</td>
                                            <td>{stat.truong_khoa}</td>
                                            <td>{stat.so_luong_dang_ky}</td>
                                        </tr>
                                    ))}
                                    {stats.length === 0 && (
                                        <tr>
                                            <td colSpan={4} style={{ textAlign: 'center' }}>Không có dữ liệu phù hợp</td>
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
