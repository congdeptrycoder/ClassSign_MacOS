import { Semester } from '../entities/Semester';

export interface ISemesterRepository {
    getAll(): Promise<Semester[]>;
}
