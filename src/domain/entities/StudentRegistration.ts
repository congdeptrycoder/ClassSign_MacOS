export type CourseRegistrationStatus =
  | 'available'
  | 'blocked'
  | 'completed'
  | 'registered';

export interface StudentProfile {
  id: number;
  name: string;
  username: string;
  id_card?: string | null;
}

export interface StudyProgram {
  id: number;
  code: string;
  name: string;
}

export interface CurriculumCourse {
  curriculumId: number;
  courseId: number;
  code: string;
  name: string;
  credits: number;
  prerequisiteCode?: string | null;
  prerequisiteName?: string | null;
  parallelCode?: string | null;
  parallelName?: string | null;
  status: CourseRegistrationStatus;
  statusLabel: string;
  hasStudied: boolean;
  studyStatusLabel: string;
  canRegister: boolean;
  blockingReason?: string | null;
}

export interface Curriculum {
  student: StudentProfile;
  program: StudyProgram;
  courses: CurriculumCourse[];
}

export interface RegisteredCourse {
  id: number;
  courseId: number;
  semester: number;
  code: string;
  name: string;
  credits: number;
  status: string;
}

export interface ClassSuggestion {
  id: number;
  courseId: number;
  code: string;
  name: string;
  credits: number;
  detail?: string | null;
  totalSlots: number;
  occupiedSlots: number;
}

export interface TimetableEntry {
  id: number;
  classId: number;
  code: string;
  name: string;
  detail?: string | null;
}
