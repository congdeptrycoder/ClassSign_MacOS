import { CourseRegistrationStat } from '../entities/CourseRegistrationStat';

export interface IAdminRepository {
    getCourseRegistrationStats(semester: number): Promise<CourseRegistrationStat[]>;
}
