import express from 'express';
import { getAllAcademicPeriods, createAcademicPeriod, deleteAcademicPeriod } from './academic-period.controller';

const router = express.Router();

router.get('/', getAllAcademicPeriods);
router.post('/', createAcademicPeriod);
router.delete('/:id', deleteAcademicPeriod);

export default router;
