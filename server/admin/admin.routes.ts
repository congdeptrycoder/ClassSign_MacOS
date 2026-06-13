import { Router } from 'express';
import { getCourseRegistrationStats, createClassCourse, updateClassCourse, getClassesByCourse, deleteClassCourse, getAllClassesBySemester } from './admin.controller';

const router = Router();

router.get('/course-registration-stats', getCourseRegistrationStats);
router.post('/classes', createClassCourse);
router.put('/classes/:id', updateClassCourse);
router.get('/classes/semester/:semester', getAllClassesBySemester);
router.get('/classes/:semester/:courseId', getClassesByCourse);
router.delete('/classes/:id', deleteClassCourse);

export default router;
