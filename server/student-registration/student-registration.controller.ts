import { Request, Response } from 'express';
import { sendError, sendSuccess } from '../httpResponse';
import {
  getCurriculum,
  getRegisteredCourses,
  getTimetable,
  registerClassSection,
  registerCourse,
  removeCourseRegistration,
  searchClassSuggestions,
  searchCourseSuggestions,
  getClassesForCourse,
} from './student-registration.service';

function parseStudentId(req: Request) {
  const studentId = Number(req.params.studentId);
  if (!Number.isInteger(studentId) || studentId <= 0) {
    throw new Error('Mã sinh viên không hợp lệ.');
  }
  return studentId;
}

function handleRouteError(res: Response, err: unknown, fallbackMessage: string) {
  const message = err instanceof Error ? err.message : fallbackMessage;
  const status =
    message.includes('không tìm thấy') || message.includes('không tồn tại')
      ? 404
      : 400;
  return sendError(res, status, message || fallbackMessage);
}

export async function getStudentCurriculum(req: Request, res: Response) {
  try {
    return sendSuccess(res, await getCurriculum(parseStudentId(req)));
  } catch (err) {
    console.error('getStudentCurriculum error:', err);
    return handleRouteError(res, err, 'Không thể lấy chương trình đào tạo.');
  }
}

export async function getStudentRegisteredCourses(req: Request, res: Response) {
  try {
    return sendSuccess(res, await getRegisteredCourses(parseStudentId(req)));
  } catch (err) {
    console.error('getStudentRegisteredCourses error:', err);
    return handleRouteError(res, err, 'Không thể lấy học phần đã đăng ký.');
  }
}

export async function getCourseSuggestions(req: Request, res: Response) {
  try {
    const query = String(req.query.q ?? '');
    const limit = Number(req.query.limit ?? 10);
    return sendSuccess(
      res,
      await searchCourseSuggestions(parseStudentId(req), query, limit)
    );
  } catch (err) {
    console.error('getCourseSuggestions error:', err);
    return handleRouteError(res, err, 'Không thể tìm gợi ý học phần.');
  }
}

export async function createCourseRegistration(req: Request, res: Response) {
  try {
    const result = await registerCourse(parseStudentId(req), req.body);
    return sendSuccess(
      res,
      result
    );
  } catch (err) {
    console.error('createCourseRegistration error:', err);
    return handleRouteError(res, err, 'Không thể đăng ký học phần.');
  }
}

export async function deleteCourseRegistration(req: Request, res: Response) {
  try {
    const courseId = Number(req.params.courseId);
    if (!Number.isInteger(courseId)) {
      throw new Error('Mã học phần không hợp lệ.');
    }
    await removeCourseRegistration(parseStudentId(req), courseId);
    return sendSuccess(res, null, 'Xoá đăng ký học phần thành công.');
  } catch (err) {
    console.error('deleteCourseRegistration error:', err);
    return handleRouteError(res, err, 'Không thể xoá đăng ký học phần.');
  }
}

export async function getClassSuggestions(req: Request, res: Response) {
  try {
    const query = String(req.query.q ?? '');
    const limit = Number(req.query.limit ?? 10);
    return sendSuccess(
      res,
      await searchClassSuggestions(parseStudentId(req), query, limit)
    );
  } catch (err) {
    console.error('getClassSuggestions error:', err);
    return handleRouteError(res, err, 'Không thể tìm gợi ý lớp học phần.');
  }
}

export async function getCourseClasses(req: Request, res: Response) {
  try {
    const courseId = Number(req.params.courseId);
    if (!Number.isInteger(courseId)) {
      throw new Error('Mã học phần không hợp lệ.');
    }
    return sendSuccess(
      res,
      await getClassesForCourse(parseStudentId(req), courseId)
    );
  } catch (err) {
    console.error('getCourseClasses error:', err);
    return handleRouteError(res, err, 'Không thể lấy danh sách lớp học phần.');
  }
}

export async function createClassRegistration(req: Request, res: Response) {
  try {
    return sendSuccess(
      res,
      await registerClassSection(parseStudentId(req), Number(req.body.classId)),
      'Đăng ký lớp học phần thành công.'
    );
  } catch (err) {
    console.error('createClassRegistration error:', err);
    return handleRouteError(res, err, 'Không thể đăng ký lớp học phần.');
  }
}

export async function getStudentTimetable(req: Request, res: Response) {
  try {
    return sendSuccess(res, await getTimetable(parseStudentId(req)));
  } catch (err) {
    console.error('getStudentTimetable error:', err);
    return handleRouteError(res, err, 'Không thể lấy thời khóa biểu.');
  }
}
