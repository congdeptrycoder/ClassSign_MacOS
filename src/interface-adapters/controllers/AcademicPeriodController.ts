import { GetAllAcademicPeriodsUseCase } from '../../application/use-cases/GetAllAcademicPeriodsUseCase';
import { SaveAcademicPeriodUseCase } from '../../application/use-cases/SaveAcademicPeriodUseCase';
import { DeleteAcademicPeriodUseCase } from '../../application/use-cases/DeleteAcademicPeriodUseCase';
import { SaveAcademicPeriodInputDTO } from '../../application/dto/AcademicPeriodDTO';

export class AcademicPeriodController {
    constructor(
        private getAllUseCase: GetAllAcademicPeriodsUseCase,
        private saveUseCase: SaveAcademicPeriodUseCase,
        private deleteUseCase: DeleteAcademicPeriodUseCase
    ) {}

    async getAll() {
        return await this.getAllUseCase.execute();
    }

    async save(input: SaveAcademicPeriodInputDTO) {
        return await this.saveUseCase.execute(input);
    }

    async delete(id: number) {
        return await this.deleteUseCase.execute(id);
    }
}
