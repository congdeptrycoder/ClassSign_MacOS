import { GetTimetableUseCase } from '../../application/use-cases/GetTimetableUseCase';

export class TimetableController {
  constructor(private getTimetableUseCase: GetTimetableUseCase) {}

  async getTimetable(studentId: number) {
    return this.getTimetableUseCase.execute(studentId);
  }
}
