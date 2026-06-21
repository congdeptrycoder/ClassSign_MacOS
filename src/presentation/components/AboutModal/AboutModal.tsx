import React from 'react';
import hustLogo from '../../../../public/images/hust-logo.png';
import './AboutModal.css';

interface AboutModalProps {
    onClose: () => void;
}

const APP_VERSION = '1.0.0';
const BUILD_DATE = '21/06/2026';

const TEAM_MEMBERS = [
    { name: 'Phan Chí Công', mssv: '20231566', role: 'Trưởng nhóm' },
    { name: 'Trần Đức Anh', mssv: '20231567', role: 'Thành viên' },
    { name: 'Nguyễn Tuấn Anh', mssv: '20231556', role: 'Thành viên' },
];

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
    return (
        <div
            id="about-modal-overlay"
            className="about-overlay"
            onClick={(e) => {
                if ((e.target as HTMLElement).id === 'about-modal-overlay') onClose();
            }}
        >
            <div className="about-card" role="dialog" aria-modal="true" aria-label="Thông tin ứng dụng">
                {/* Header */}
                <div className="about-header">
                    <img src={hustLogo} alt="HUST Logo" className="about-logo" />
                    <div className="about-header-text">
                        <h2 className="about-app-name">Hệ thống đăng ký học tập</h2>
                        <span className="about-version">Phiên bản {APP_VERSION}</span>
                    </div>
                </div>

                <div className="about-divider" />

                {/* Course info */}
                <section className="about-section">
                    <div className="about-info-row">
                        <span className="about-label">Tên môn học</span>
                        <span className="about-value">AC3030 – Phát triển ứng dụng</span>
                    </div>
                    <div className="about-info-row">
                        <span className="about-label">Học kỳ</span>
                        <span className="about-value">20252</span>
                    </div>
                    <div className="about-info-row">
                        <span className="about-label">Nhóm</span>
                        <span className="about-value">Nhóm 1</span>
                    </div>
                    <div className="about-info-row">
                        <span className="about-label">Ngày build</span>
                        <span className="about-value">{BUILD_DATE}</span>
                    </div>
                </section>

                <div className="about-divider" />

                {/* Team members */}
                <section className="about-section">
                    <h3 className="about-section-title">Danh sách thành viên</h3>
                    <table className="about-table">
                        <thead>
                            <tr>
                                <th>Họ tên</th>
                                <th>MSSV</th>
                                <th>Vai trò</th>
                            </tr>
                        </thead>
                        <tbody>
                            {TEAM_MEMBERS.map((member) => (
                                <tr key={member.mssv}>
                                    <td className="about-member-name">
                                        <span className="about-avatar-placeholder">
                                            {member.name.charAt(member.name.lastIndexOf(' ') + 1)}
                                        </span>
                                        {member.name}
                                    </td>
                                    <td>{member.mssv}</td>
                                    <td>
                                        <span className={`about-role-badge ${member.role === 'Trưởng nhóm' ? 'about-role-leader' : 'about-role-member'}`}>
                                            {member.role}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* Close button */}
                <button
                    id="about-modal-close-btn"
                    className="about-close-btn"
                    onClick={onClose}
                >
                    Đóng
                </button>
            </div>
        </div>
    );
};
