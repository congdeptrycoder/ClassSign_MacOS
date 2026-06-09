import { useEffect, useState } from 'react';
import { ManageStudentRegistration } from '../../../application/use-cases/ManageStudentRegistration';
import {
  Curriculum,
  CurriculumCourse,
} from '../../../domain/entities/StudentRegistration';
import { StudentRegistrationRepositoryImpl } from '../../../infrastructure/repositories/StudentRegistrationRepositoryImpl';

const registrationUseCase = new ManageStudentRegistration(
  new StudentRegistrationRepositoryImpl()
);

export const useCurriculumViewModel = (studentId: number) => {
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeringCourseId, setRegisteringCourseId] = useState<number | null>(null);

  const loadCurriculum = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setCurriculum(await registrationUseCase.getCurriculum(studentId));
    } catch (err: any) {
      setError(err.message || 'Không thể tải chương trình đào tạo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCurriculum();
  }, [studentId]);

  const handleRegisterCourse = async (course: CurriculumCourse) => {
    if (!course.canRegister) {
      window.alert(course.blockingReason || 'Học phần chưa đủ điều kiện đăng ký.');
      return;
    }

    try {
      setRegisteringCourseId(course.courseId);
      await registrationUseCase.registerCourse(studentId, course.courseId);
      window.alert(`Đã đăng ký học phần ${course.code}.`);
      await loadCurriculum();
    } catch (err: any) {
      window.alert(err.message || 'Đăng ký học phần thất bại.');
    } finally {
      setRegisteringCourseId(null);
    }
  };

  return {
    curriculum,
    isLoading,
    error,
    registeringCourseId,
    reload: loadCurriculum,
    handleRegisterCourse,
  };
};
