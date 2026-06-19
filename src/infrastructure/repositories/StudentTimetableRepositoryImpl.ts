import {
  TimetableEntry,
} from '../../domain/entities/StudentRegistration';
import { ITimetableRepository } from '../../domain/repositories/ITimetableRepository';
import { apiClient } from '../api/apiClient';

export class StudentTimetableRepositoryImpl implements ITimetableRepository {
  getTimetable(studentId: number, semesterId?: string): Promise<TimetableEntry[]> {
    const query = semesterId ? `?semesterId=${semesterId}` : '';
    return apiClient.get<TimetableEntry[]>(`/students/${studentId}/timetable${query}`);
  }
}
