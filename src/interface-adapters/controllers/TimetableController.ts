import { GetTimetableUseCase } from '../../application/use-cases/GetTimetableUseCase';

export class TimetableController {
  constructor(private getTimetableUseCase: GetTimetableUseCase) {}

  async getTimetable(studentId: number, semesterId?: string) {
    return this.getTimetableUseCase.execute(studentId, semesterId);
  }
}
