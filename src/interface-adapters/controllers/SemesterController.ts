import { GetAllSemestersUseCase } from '../../application/use-cases/GetAllSemestersUseCase';
import { CreateSemesterUseCase } from '../../application/use-cases/CreateSemesterUseCase';

export class SemesterController {
    constructor(
        private getAllSemestersUseCase: GetAllSemestersUseCase,
        private createSemesterUseCase: CreateSemesterUseCase
    ) {}

    async getAllSemesters() {
        return await this.getAllSemestersUseCase.execute();
    }

    async createSemester(semesterCode: string) {
        return await this.createSemesterUseCase.execute(semesterCode);
    }
}
