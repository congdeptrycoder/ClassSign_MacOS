import { CreateClassCourseUseCase } from '../../application/use-cases/CreateClassCourseUseCase';
import { GetClassesByCourseUseCase } from '../../application/use-cases/GetClassesByCourseUseCase';
import { DeleteClassCourseUseCase } from '../../application/use-cases/DeleteClassCourseUseCase';
import { GetAllClassesBySemesterUseCase } from '../../application/use-cases/GetAllClassesBySemesterUseCase';
import { UpdateClassCourseUseCase } from '../../application/use-cases/UpdateClassCourseUseCase';
import { SaveClassCourseInputDTO, ClassCourseOutputDTO } from '../../application/dto/AdminClassDTO';

export class AdminClassController {
    constructor(
        private createClassCourseUseCase: CreateClassCourseUseCase,
        private getClassesByCourseUseCase: GetClassesByCourseUseCase,
        private deleteClassCourseUseCase: DeleteClassCourseUseCase,
        private getAllClassesBySemesterUseCase: GetAllClassesBySemesterUseCase,
        private updateClassCourseUseCase: UpdateClassCourseUseCase
    ) {}

    async createClassCourse(data: SaveClassCourseInputDTO): Promise<void> {
        await this.createClassCourseUseCase.execute(data);
    }

    async updateClassCourse(id: number, data: SaveClassCourseInputDTO): Promise<void> {
        await this.updateClassCourseUseCase.execute(id, data);
    }

    async getClassesByCourse(semester: number, courseId: number): Promise<ClassCourseOutputDTO[]> {
        return await this.getClassesByCourseUseCase.execute(semester, courseId);
    }

    async getAllClassesBySemester(semester: number): Promise<ClassCourseOutputDTO[]> {
        return await this.getAllClassesBySemesterUseCase.execute(semester);
    }

    async deleteClassCourse(classId: number): Promise<void> {
        await this.deleteClassCourseUseCase.execute(classId);
    }
}
