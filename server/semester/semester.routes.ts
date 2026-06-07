import express from 'express';
import { getAllSemesters } from './semester.controller';

const router = express.Router();

router.get('/', getAllSemesters);

export default router;
