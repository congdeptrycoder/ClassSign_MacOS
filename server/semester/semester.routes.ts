import express from 'express';
import { getAllSemesters, createSemester } from './semester.controller';

const router = express.Router();

router.get('/', getAllSemesters);
router.post('/', createSemester);

export default router;
