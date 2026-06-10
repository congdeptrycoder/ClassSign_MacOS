import { GetCourseRegistrationStatsUseCase } from '../../application/use-cases/GetCourseRegistrationStatsUseCase';
import { CourseRegistrationStat } from '../../domain/entities/CourseRegistrationStat';

export class AdminController {
    constructor(private getCourseRegistrationStatsUseCase: GetCourseRegistrationStatsUseCase) {}

    async getCourseRegistrationStats(semester: number): Promise<CourseRegistrationStat[]> {
        return this.getCourseRegistrationStatsUseCase.execute(semester);
    }
}
