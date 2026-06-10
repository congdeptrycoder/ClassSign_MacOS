import { Router } from 'express';
import { getCourseRegistrationStats } from './admin.controller';

const router = Router();

router.get('/course-registration-stats', getCourseRegistrationStats);

export default router;
