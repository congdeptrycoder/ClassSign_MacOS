import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CurriculumCourse } from '../../../domain/entities/StudentRegistration';
import { useCurriculumViewModel } from '../../../interface-adapters/viewmodels/Curriculum/useCurriculumViewModel';
import { getCurrentAccount } from '../../../shared/session/currentUserSession';
import { AlarmOneChoose } from '../../components/AlarmOneChoose/AlarmOneChoose';
import '../StudentDashboard/StudentDashboard.css';
import './Curriculum.css';

export const Curriculum = () => {
  const navigate = useNavigate();
  const account = getCurrentAccount();
  const {
    curriculum,
    isLoading,
    error,
    registeringCourseId,
    alarmMessage,
    setAlarmMessage,
    handleRegisterCourse,
  } = useCurriculumViewModel(account?.id ?? 1);

  const [searchQuery, setSearchQuery] = useState('');

  const totalCourses = curriculum?.courses.length ?? 0;
  const completedCourses = curriculum?.courses.filter(course => course.status === 'completed').length ?? 0;
  const registeredCourses = curriculum?.courses.filter(course => course.status === 'registered').length ?? 0;

  const filteredCourses = curriculum?.courses.filter(course =>
    course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const renderAction = (course: CurriculumCourse) => {

    return (
      <button
        className="primary-btn small-btn"
        onClick={() => handleRegisterCourse(course)}
        disabled={registeringCourseId === course.courseId}
      >
        {registeringCourseId === course.courseId ? '...' : 'Đăng ký'}
      </button>
    );
  };

  return (
    <div className="student-container">
      {alarmMessage && (
        <AlarmOneChoose
          message={alarmMessage}
          buttonText="Đóng"
          onClose={() => setAlarmMessage(null)}
        />
      )}
      <header className="curriculum-header">
        <button className="secondary-btn back-nav-btn" onClick={() => navigate('/student')}>
          Quay lại
        </button>
        <div className="curriculum-title-block">
          <span className="page-kicker">Chương trình đào tạo</span>
          <h1>
            {curriculum?.program
              ? `${curriculum.program.code} - ${curriculum.program.name}`
              : 'Danh sách học phần'}
          </h1>
        </div>
      </header>

      <main className="student-content">
        {isLoading && <div className="card state-panel">Đang tải dữ liệu...</div>}

        {error && !isLoading && (
          <div className="card state-panel">
            <h3>Không thể tải dữ liệu</h3>
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && curriculum && (
          <section className="registration-table card curriculum-card">
            <div className="curriculum-summary">
              <div>
                <span>Tổng học phần</span>
                <strong>{totalCourses}</strong>
              </div>
              <div style={{ backgroundColor: '#708238', color: '#fff', padding: '10px', borderRadius: '8px' }}>
                <span>Đã học xong</span>
                <strong>{completedCourses}</strong>
              </div>
              <div style={{ backgroundColor: '#C49102', color: '#fff', padding: '10px', borderRadius: '8px' }}>
                <span>Đã đăng ký, chưa học xong</span>
                <strong>{registeredCourses}</strong>
              </div>
            </div>
            <div className="panel-header" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
              <input
                className="search-input"
                placeholder="Tìm theo Mã HP hoặc Tên học phần"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', maxWidth: '400px' }}
              />
            </div>
            <h3 className="section-title">
              {curriculum.student.name} - {curriculum.student.id_card ?? curriculum.student.username}
            </h3>
            <div className="table-scroll">
              <table className="info-table curriculum-table">
                <thead>
                  <tr>
                    <th>Mã HP</th>
                    <th>Tên học phần</th>
                    <th>TC</th>
                    <th>Tiên quyết</th>
                    <th>Song hành</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map(course => (
                    <tr
                      key={course.curriculumId}
                      style={{
                        backgroundColor: course.status === 'completed' ? '#708238' : course.status === 'registered' ? '#C49102' : undefined,
                        color: (course.status === 'completed' || course.status === 'registered') ? '#fff' : undefined,
                      }}
                    >
                      <td><span className="course-code" style={{ color: (course.status === 'completed' || course.status === 'registered') ? '#fff' : undefined }}>{course.code}</span></td>
                      <td>{course.name}</td>
                      <td>{course.credits}</td>
                      <td>{course.prerequisiteCode ?? '-'}</td>
                      <td>{course.parallelCode ?? '-'}</td>
                      <td>{renderAction(course)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
