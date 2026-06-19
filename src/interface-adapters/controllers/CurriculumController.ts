import { GetCurriculumUseCase } from '../../application/use-cases/GetCurriculumUseCase';

export class CurriculumController {
  constructor(private getCurriculumUseCase: GetCurriculumUseCase) {}

  async getCurriculum(studentId: number) {
    return this.getCurriculumUseCase.execute(studentId);
  }
}
