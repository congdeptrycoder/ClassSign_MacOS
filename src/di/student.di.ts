import { StudentCourseRegistrationRepositoryImpl } from '../infrastructure/repositories/StudentCourseRegistrationRepositoryImpl';
import { StudentClassRegistrationRepositoryImpl } from '../infrastructure/repositories/StudentClassRegistrationRepositoryImpl';
import { StudentTimetableRepositoryImpl } from '../infrastructure/repositories/StudentTimetableRepositoryImpl';
import { ICourseRegistrationRepository } from '../domain/repositories/ICourseRegistrationRepository';
import { IClassRegistrationRepository } from '../domain/repositories/IClassRegistrationRepository';
import { ITimetableRepository } from '../domain/repositories/ITimetableRepository';
import { GetCurriculumUseCase } from '../application/use-cases/GetCurriculumUseCase';
import { GetRegisteredCoursesUseCase } from '../application/use-cases/GetRegisteredCoursesUseCase';
import { SearchCourseSuggestionsUseCase } from '../application/use-cases/SearchCourseSuggestionsUseCase';
import { RegisterCourseUseCase } from '../application/use-cases/RegisterCourseUseCase';
import { CancelCourseRegistrationUseCase } from '../application/use-cases/CancelCourseRegistrationUseCase';
import { SearchClassSuggestionsUseCase } from '../application/use-cases/SearchClassSuggestionsUseCase';
import { RegisterClassUseCase } from '../application/use-cases/RegisterClassUseCase';
import { CancelClassRegistrationUseCase } from '../application/use-cases/CancelClassRegistrationUseCase';
import { GetClassesForCourseUseCase } from '../application/use-cases/GetClassesForCourseUseCase';
import { GetTimetableUseCase } from '../application/use-cases/GetTimetableUseCase';

import { CurriculumController } from '../interface-adapters/controllers/CurriculumController';
import { CourseRegistrationController } from '../interface-adapters/controllers/CourseRegistrationController';
import { ClassRegistrationController } from '../interface-adapters/controllers/ClassRegistrationController';
import { TimetableController } from '../interface-adapters/controllers/TimetableController';

// 1. Instantiate Repository (Infrastructure Layer)
const courseRegistrationRepo: ICourseRegistrationRepository = new StudentCourseRegistrationRepositoryImpl();
const classRegistrationRepo: IClassRegistrationRepository = new StudentClassRegistrationRepositoryImpl();
const timetableRepo: ITimetableRepository = new StudentTimetableRepositoryImpl();

// 2. Instantiate Use Cases (Application Layer)
const getCurriculumUseCase = new GetCurriculumUseCase(courseRegistrationRepo);
const getRegisteredCoursesUseCase = new GetRegisteredCoursesUseCase(courseRegistrationRepo);
const searchCourseSuggestionsUseCase = new SearchCourseSuggestionsUseCase(courseRegistrationRepo);
const registerCourseUseCase = new RegisterCourseUseCase(courseRegistrationRepo);
const cancelCourseRegistrationUseCase = new CancelCourseRegistrationUseCase(courseRegistrationRepo);

const searchClassSuggestionsUseCase = new SearchClassSuggestionsUseCase(classRegistrationRepo);
const registerClassUseCase = new RegisterClassUseCase(classRegistrationRepo);
const cancelClassRegistrationUseCase = new CancelClassRegistrationUseCase(classRegistrationRepo);
const getClassesForCourseUseCase = new GetClassesForCourseUseCase(classRegistrationRepo);

const getTimetableUseCase = new GetTimetableUseCase(timetableRepo);

// 3. Instantiate Controllers (Interface Adapters Layer)
export const curriculumController = new CurriculumController(getCurriculumUseCase);

export const courseRegistrationController = new CourseRegistrationController(
    getRegisteredCoursesUseCase,
    searchCourseSuggestionsUseCase,
    registerCourseUseCase,
    cancelCourseRegistrationUseCase
);

export const classRegistrationController = new ClassRegistrationController(
    searchClassSuggestionsUseCase,
    registerClassUseCase,
    cancelClassRegistrationUseCase,
    getClassesForCourseUseCase
);

export const timetableController = new TimetableController(getTimetableUseCase);

