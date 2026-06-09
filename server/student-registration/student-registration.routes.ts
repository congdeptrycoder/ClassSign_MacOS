import { Router } from 'express';
import {
  createClassRegistration,
  createCourseRegistration,
  getClassSuggestions,
  getCourseSuggestions,
  getStudentCurriculum,
  getStudentRegisteredCourses,
  getStudentTimetable,
} from './student-registration.controller';

const router = Router();

router.get('/:studentId/curriculum', getStudentCurriculum);
router.get('/:studentId/registered-courses', getStudentRegisteredCourses);
router.get('/:studentId/course-suggestions', getCourseSuggestions);
router.post('/:studentId/course-registrations', createCourseRegistration);
router.get('/:studentId/class-suggestions', getClassSuggestions);
router.post('/:studentId/class-registrations', createClassRegistration);
router.get('/:studentId/timetable', getStudentTimetable);

export default router;
