import express from 'express';
import { getAllAcademicPeriods, createAcademicPeriod, updateAcademicPeriod, deleteAcademicPeriod } from './academic-period.controller';

const router = express.Router();

router.get('/', getAllAcademicPeriods);
router.post('/', createAcademicPeriod);
router.put('/:id', updateAcademicPeriod);
router.delete('/:id', deleteAcademicPeriod);

export default router;
