import { CreateClassCourseUseCase } from '../../application/use-cases/CreateClassCourseUseCase';
import { GetClassesByCourseUseCase } from '../../application/use-cases/GetClassesByCourseUseCase';
import { DeleteClassCourseUseCase } from '../../application/use-cases/DeleteClassCourseUseCase';
import { GetAllClassesBySemesterUseCase } from '../../application/use-cases/GetAllClassesBySemesterUseCase';
import { UpdateClassCourseUseCase } from '../../application/use-cases/UpdateClassCourseUseCase';

export class AdminClassController {
    constructor(
        private createClassCourseUseCase: CreateClassCourseUseCase,
        private getClassesByCourseUseCase?: GetClassesByCourseUseCase,
        private deleteClassCourseUseCase?: DeleteClassCourseUseCase,
        private getAllClassesBySemesterUseCase?: GetAllClassesBySemesterUseCase,
        private updateClassCourseUseCase?: UpdateClassCourseUseCase
    ) {}

    async createClassCourse(data: any): Promise<void> {
        await this.createClassCourseUseCase.execute(data);
    }

    async updateClassCourse(id: number, data: any): Promise<void> {
        if (!this.updateClassCourseUseCase) throw new Error("UseCase not provided");
        await this.updateClassCourseUseCase.execute(id, data);
    }

    async getClassesByCourse(semester: number, courseId: number): Promise<any[]> {
        if (!this.getClassesByCourseUseCase) throw new Error("UseCase not provided");
        return await this.getClassesByCourseUseCase.execute(semester, courseId);
    }

    async getAllClassesBySemester(semester: number): Promise<any[]> {
        if (!this.getAllClassesBySemesterUseCase) throw new Error("UseCase not provided");
        return await this.getAllClassesBySemesterUseCase.execute(semester);
    }

    async deleteClassCourse(classId: number): Promise<void> {
        if (!this.deleteClassCourseUseCase) throw new Error("UseCase not provided");
        await this.deleteClassCourseUseCase.execute(classId);
    }
}
