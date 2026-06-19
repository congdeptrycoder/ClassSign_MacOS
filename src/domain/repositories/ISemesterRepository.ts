import { Semester } from '../entities/Semester';

export interface ISemesterRepository {
    getAll(): Promise<Semester[]>;
    createSemester(semesterCode: string): Promise<void>;
}
