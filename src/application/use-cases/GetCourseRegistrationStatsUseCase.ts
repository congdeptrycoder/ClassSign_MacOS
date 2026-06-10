import { IAdminRepository } from '../../domain/repositories/IAdminRepository';
import { CourseRegistrationStat } from '../../domain/entities/CourseRegistrationStat';

export class GetCourseRegistrationStatsUseCase {
    constructor(private adminRepository: IAdminRepository) {}

    async execute(semester: number): Promise<CourseRegistrationStat[]> {
        return this.adminRepository.getCourseRegistrationStats(semester);
    }
}
