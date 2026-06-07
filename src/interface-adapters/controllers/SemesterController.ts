import { GetAllSemestersUseCase } from '../../application/use-cases/GetAllSemestersUseCase';

export class SemesterController {
    constructor(private getAllSemestersUseCase: GetAllSemestersUseCase) {}

    async getAllSemesters() {
        return await this.getAllSemestersUseCase.execute();
    }
}
