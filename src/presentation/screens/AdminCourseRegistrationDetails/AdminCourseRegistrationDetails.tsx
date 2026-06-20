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
            semester: semesterString,
            departmentName: stat.departmentName,
            courseCode: stat.courseCode,
            courseName: stat.courseName,
            classCode: cls.classCode,
            subClassCode: cls.subClassCode !== 'NULL' && cls.subClassCode ? cls.subClassCode : '',
            notes: cls.notes !== 'NULL' && cls.notes ? cls.notes : '',
            dayOfWeek: cls.dayOfWeek,
            startPeriod: cls.startPeriod,
            endPeriod: cls.endPeriod,
            daySession: cls.daySession,
            room: cls.room,
            requiresExperiment: cls.requiresExperiment !== 'NULL' && cls.requiresExperiment ? cls.requiresExperiment : '',
            maxSlots: cls.maxSlots,
            occupiedSlots: cls.occupiedSlots,
            teachingType: cls.teachingType !== 'NULL' && cls.teachingType ? cls.teachingType : ''
        };
        navigate('/admin/edit', { state: { classData } });
    };

    const handleExportCSV = () => {
        if (!window.confirm("Xác nhận tải file CSV")) return;

        let csvContent = "Mã lớp,Mã lớp kèm,Mã HP,Tên HP,Ghi chú,Thứ,Tiết BĐ,Tiết KT,Buổi,Phòng học,Cần TN,SL Max,SL ĐK,Loại\n";
        
        stats.forEach(stat => {
            const classes = courseClasses[stat.courseId] || [];
            classes.forEach(cls => {
                const row = [
                    cls.classCode,
                    cls.subClassCode !== 'NULL' && cls.subClassCode ? cls.subClassCode : '',
                    stat.courseCode,
                    stat.courseName,
                    cls.notes !== 'NULL' && cls.notes ? cls.notes : '',
                    cls.dayOfWeek !== 'NULL' && cls.dayOfWeek !== undefined ? cls.dayOfWeek : '',
                    cls.startPeriod,
                    cls.endPeriod,
                    cls.daySession,
                    cls.room,
                    cls.requiresExperiment !== 'NULL' && cls.requiresExperiment ? cls.requiresExperiment : '',
                    cls.maxSlots,
                    cls.occupiedSlots,
                    cls.teachingType !== 'NULL' && cls.teachingType ? cls.teachingType : ''
                ];
                // Escape quotes and commas
                const escapedRow = row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',');
                csvContent += escapedRow + "\n";
            });
        });

        // Add BOM for Excel UTF-8 support
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `danh_sach_lop_hoc_${semesterString}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                    <div>
                        <button className="primary-btn" onClick={handleExportCSV} style={{ marginRight: '10px' }}>
                            Xuất CSV
                        </button>
                        <button className="delete-btn" onClick={handleBack}>
                            Quay lại
                        </button>
                    </div>
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
                                        if (stat.classCount === 0) {
                                            trangThai = "Chưa có lớp";
                                        } else if (stat.maxRegistrationCount < stat.registrationCount) {
                                            trangThai = "Chưa phục vụ đủ sinh viên";
                                        }

                                        return (
                                            <React.Fragment key={idx}>
                                                <tr>
                                                    <td>{stat.courseCode}</td>
                                                <td>{stat.courseName}</td>
                                                <td>{stat.departmentName}</td>
                                                <td>{stat.registrationCount}</td>
                                                <td>{stat.classCount}</td>
                                                <td>{stat.maxRegistrationCount}</td>
                                                <td>
                                                    <span style={{
                                                        color: trangThai === "Đã đáp ứng đủ" ? 'var(--statusSuccess)' : 'var(--statusDanger)',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {trangThai}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="primary-btn" style={{ marginRight: '5px', fontSize: '12px', padding: '5px 10px' }} onClick={() => navigate('/admin/create-class', {
                                                        state: {
                                                            semester: semesterString,
                                                            departmentName: stat.departmentName,
                                                            courseCode: stat.courseCode,
                                                            courseName: stat.courseName
                                                        }
                                                    })}>Mở lớp</button>
                                                    <button className="secondary-btn" style={{ fontSize: '12px', padding: '5px 10px' }} onClick={() => toggleExpandCourse(stat.courseId, semester!)}>
                                                        {expandedCourseId === stat.courseId ? 'Đóng danh sách' : 'Xem danh sách lớp'}
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedCourseId === stat.courseId && (
                                                <tr key={`expanded-${stat.courseId}`} style={{ backgroundColor: 'var(--surface)' }}>
                                                    <td colSpan={8} style={{ padding: '20px' }}>
                                                        {loadingClasses && !courseClasses[stat.courseId] ? (
                                                            <p>Đang tải danh sách lớp...</p>
                                                        ) : (courseClasses[stat.courseId] || []).length === 0 ? (
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
                                                                    {(courseClasses[stat.courseId] || []).map((cls, cIdx) => (
                                                                        <tr key={cIdx}>
                                                                            <td>{cls.classCode}</td>
                                                                            <td>{cls.subClassCode !== 'NULL' ? cls.subClassCode : ''}</td>
                                                                            <td>{cls.notes !== 'NULL' ? cls.notes : ''}</td>
                                                                            <td>{cls.dayOfWeek !== 'NULL' && cls.dayOfWeek !== undefined ? cls.dayOfWeek : ''}</td>
                                                                            <td>{cls.startPeriod}</td>
                                                                            <td>{cls.endPeriod}</td>
                                                                            <td>{cls.daySession}</td>
                                                                            <td>{cls.room}</td>
                                                                            <td>{cls.requiresExperiment !== 'NULL' ? cls.requiresExperiment : ''}</td>
                                                                            <td>{cls.occupiedSlots}</td>
                                                                            <td>{cls.maxSlots}</td>
                                                                            <td>{cls.teachingType !== 'NULL' ? cls.teachingType : ''}</td>
                                                                            <td>
                                                                                <div className="action-cell">
                                                                                    <button className="edit-btn" style={{ fontSize: '10px', padding: '3px 6px' }} onClick={() => handleEditClass(cls, stat)}>Sửa</button>
                                                                                    <button className="delete-btn" style={{ fontSize: '10px', padding: '3px 6px' }} onClick={() => handleDeleteClass(cls.id, stat.courseId, semester!)}>Xoá</button>
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
