import {
  TimetableEntry,
} from '../entities/StudentRegistration';

export interface ITimetableRepository {
  getTimetable(studentId: number, semesterId?: string): Promise<TimetableEntry[]>;
}
