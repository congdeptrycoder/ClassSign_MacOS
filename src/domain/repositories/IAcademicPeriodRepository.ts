import { AcademicPeriod } from '../entities/AcademicPeriod';

export interface IAcademicPeriodRepository {
    getAll(): Promise<AcademicPeriod[]>;
    save(semester: number, period_type: string, start_date: string, end_date: string): Promise<number>;
    delete(id: number): Promise<void>;
}
