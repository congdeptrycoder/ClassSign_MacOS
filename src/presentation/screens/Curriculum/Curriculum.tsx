import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CurriculumCourse } from '../../../domain/entities/StudentRegistration';
import { useCurriculumViewModel } from '../../../interface-adapters/viewmodels/Curriculum/useCurriculumViewModel';
import { getCurrentAccount } from '../../../shared/session/currentUserSession';
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
    handleRegisterCourse,
  } = useCurriculumViewModel(account?.id ?? 1);
  const totalCourses = curriculum?.courses.length ?? 0;
  const completedCourses = curriculum?.courses.filter(course => course.hasStudied).length ?? 0;
  const registeredCourses = curriculum?.courses.filter(course => course.status === 'registered').length ?? 0;
  const availableCourses = curriculum?.courses.filter(course => course.status === 'available').length ?? 0;

  const renderAction = (course: CurriculumCourse) => {
    if (!course.canRegister) return <span className="muted-text">-</span>;

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
          <p>{curriculum?.student.name ?? account?.name ?? 'Sinh viên'}</p>
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
              <div>
                <span>Đã học</span>
                <strong>{completedCourses}</strong>
              </div>
              <div>
                <span>Đã đăng ký</span>
                <strong>{registeredCourses}</strong>
              </div>
              <div>
                <span>Có thể đăng ký</span>
                <strong>{availableCourses}</strong>
              </div>
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
                    <th>Đã học</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {curriculum.courses.map(course => (
                    <tr key={course.curriculumId}>
                      <td><span className="course-code">{course.code}</span></td>
                      <td>{course.name}</td>
                      <td>{course.credits}</td>
                      <td>{course.prerequisiteCode ?? '-'}</td>
                      <td>{course.parallelCode ?? '-'}</td>
                      <td>
                        <span className={`table-status ${course.hasStudied ? 'status-completed' : 'status-unlearned'}`}>
                          {course.studyStatusLabel}
                        </span>
                      </td>
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
