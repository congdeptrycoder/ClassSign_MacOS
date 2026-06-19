import { useEffect, useState } from 'react';
import {
  Curriculum,
  CurriculumCourse,
} from '../../../domain/entities/StudentRegistration';
import { curriculumController, courseRegistrationController } from '../../../di/student.di';

export const useCurriculumViewModel = (studentId: number) => {
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeringCourseId, setRegisteringCourseId] = useState<number | null>(null);
  const [alarmMessage, setAlarmMessage] = useState<string | null>(null);

  const loadCurriculum = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setCurriculum(await curriculumController.getCurriculum(studentId));
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
    try {
      setRegisteringCourseId(course.courseId);
      await courseRegistrationController.registerCourse(studentId, course.courseId);
      setAlarmMessage(`Đã đăng ký học phần ${course.code}.`);
      await loadCurriculum();
    } catch (err: any) {
      setAlarmMessage(err.message || 'Đăng ký học phần thất bại.');
    } finally {
      setRegisteringCourseId(null);
    }
  };

  return {
    curriculum,
    isLoading,
    error,
    registeringCourseId,
    alarmMessage,
    setAlarmMessage,
    reload: loadCurriculum,
    handleRegisterCourse,
  };
};
