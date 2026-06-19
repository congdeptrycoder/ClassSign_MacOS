import { AdminClassRepositoryImpl } from '../infrastructure/repositories/AdminClassRepositoryImpl';
import { AdminRepositoryImpl } from '../infrastructure/repositories/AdminRepositoryImpl';
import { SemesterRepositoryImpl } from '../infrastructure/repositories/SemesterRepositoryImpl';
import { AcademicPeriodRepositoryImpl } from '../infrastructure/repositories/AcademicPeriodRepositoryImpl';

import { IAdminClassRepository } from '../domain/repositories/IAdminClassRepository';
import { IAdminRepository } from '../domain/repositories/IAdminRepository';
import { ISemesterRepository } from '../domain/repositories/ISemesterRepository';
import { IAcademicPeriodRepository } from '../domain/repositories/IAcademicPeriodRepository';

import { GetAllSemestersUseCase } from '../application/use-cases/GetAllSemestersUseCase';
import { CreateSemesterUseCase } from '../application/use-cases/CreateSemesterUseCase';
import { GetAllAcademicPeriodsUseCase } from '../application/use-cases/GetAllAcademicPeriodsUseCase';
import { SaveAcademicPeriodUseCase } from '../application/use-cases/SaveAcademicPeriodUseCase';
import { DeleteAcademicPeriodUseCase } from '../application/use-cases/DeleteAcademicPeriodUseCase';
import { CreateClassCourseUseCase } from '../application/use-cases/CreateClassCourseUseCase';
import { GetClassesByCourseUseCase } from '../application/use-cases/GetClassesByCourseUseCase';
import { DeleteClassCourseUseCase } from '../application/use-cases/DeleteClassCourseUseCase';
import { GetAllClassesBySemesterUseCase } from '../application/use-cases/GetAllClassesBySemesterUseCase';
import { UpdateClassCourseUseCase } from '../application/use-cases/UpdateClassCourseUseCase';
import { GetCourseRegistrationStatsUseCase } from '../application/use-cases/GetCourseRegistrationStatsUseCase';

import { SemesterController } from '../interface-adapters/controllers/SemesterController';
import { AcademicPeriodController } from '../interface-adapters/controllers/AcademicPeriodController';
import { AdminClassController } from '../interface-adapters/controllers/AdminClassController';
import { AdminController } from '../interface-adapters/controllers/AdminController';

// 1. Instantiate Repositories (Infrastructure Layer)
// Ở đây chúng ta khởi tạo các Class Cụ Thể (Concrete) và gán cho các Biến mang kiểu Interface (Abstraction)
// Điều này giống y hệt ví dụ: HinhThucThongBao thongBao = new GuiEmail();
const adminClassRepository: IAdminClassRepository = new AdminClassRepositoryImpl();
const adminRepository: IAdminRepository = new AdminRepositoryImpl();
const semesterRepository: ISemesterRepository = new SemesterRepositoryImpl();
const academicPeriodRepository: IAcademicPeriodRepository = new AcademicPeriodRepositoryImpl();

// 2. Instantiate Use Cases (Application Layer)
const getAllSemestersUseCase = new GetAllSemestersUseCase(semesterRepository);
const createSemesterUseCase = new CreateSemesterUseCase(semesterRepository);

const getAllAcademicPeriodsUseCase = new GetAllAcademicPeriodsUseCase(academicPeriodRepository);
const saveAcademicPeriodUseCase = new SaveAcademicPeriodUseCase(academicPeriodRepository);
const deleteAcademicPeriodUseCase = new DeleteAcademicPeriodUseCase(academicPeriodRepository);

const createClassCourseUseCase = new CreateClassCourseUseCase(adminClassRepository);
const getClassesByCourseUseCase = new GetClassesByCourseUseCase(adminClassRepository);
const deleteClassCourseUseCase = new DeleteClassCourseUseCase(adminClassRepository);
const getAllClassesBySemesterUseCase = new GetAllClassesBySemesterUseCase(adminClassRepository);
const updateClassCourseUseCase = new UpdateClassCourseUseCase(adminClassRepository);

const getCourseRegistrationStatsUseCase = new GetCourseRegistrationStatsUseCase(adminRepository);

// 3. Instantiate Controllers (Interface Adapters Layer)
export const semesterController = new SemesterController(getAllSemestersUseCase, createSemesterUseCase);

export const academicPeriodController = new AcademicPeriodController(
    getAllAcademicPeriodsUseCase,
    saveAcademicPeriodUseCase,
    deleteAcademicPeriodUseCase
);

export const adminClassController = new AdminClassController(
    createClassCourseUseCase,
    getClassesByCourseUseCase,
    deleteClassCourseUseCase,
    getAllClassesBySemesterUseCase,
    updateClassCourseUseCase
);

export const adminController = new AdminController(getCourseRegistrationStatsUseCase);
