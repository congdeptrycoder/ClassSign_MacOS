import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateClassCourseUseCase } from '../../../../src/application/use-cases/CreateClassCourseUseCase';
import { DeleteAcademicPeriodUseCase } from '../../../../src/application/use-cases/DeleteAcademicPeriodUseCase';
import { DeleteClassCourseUseCase } from '../../../../src/application/use-cases/DeleteClassCourseUseCase';
import { GetAllAcademicPeriodsUseCase } from '../../../../src/application/use-cases/GetAllAcademicPeriodsUseCase';
import { GetAllClassesBySemesterUseCase } from '../../../../src/application/use-cases/GetAllClassesBySemesterUseCase';
import { GetClassesByCourseUseCase } from '../../../../src/application/use-cases/GetClassesByCourseUseCase';
import { GetCourseRegistrationStatsUseCase } from '../../../../src/application/use-cases/GetCourseRegistrationStatsUseCase';
import { SaveAcademicPeriodUseCase } from '../../../../src/application/use-cases/SaveAcademicPeriodUseCase';
import { UpdateClassCourseUseCase } from '../../../../src/application/use-cases/UpdateClassCourseUseCase';

describe('Admin Use Cases', () => {
    let mockAdminRepo: any;
    let mockAcademicRepo: any;
    let mockClassRepo: any;

    beforeEach(() => {
        mockAdminRepo = {
            getCourseRegistrationStats: vi.fn()
        };
        mockAcademicRepo = {
            getAll: vi.fn(),
            save: vi.fn(),
            delete: vi.fn()
        };
        mockClassRepo = {
            createClassCourse: vi.fn(),
            updateClassCourse: vi.fn(),
            deleteClassCourse: vi.fn(),
            getAllClassesBySemester: vi.fn(),
            getClassesByCourse: vi.fn()
        };
    });

    it('should create class course', async () => {
        const useCase = new CreateClassCourseUseCase(mockClassRepo);
        await useCase.execute({ ma_lop: 'A' } as any);
        expect(mockClassRepo.createClassCourse).toHaveBeenCalledWith({ ma_lop: 'A' });
    });

    it('should update class course', async () => {
        const useCase = new UpdateClassCourseUseCase(mockClassRepo);
        await useCase.execute(1, { ma_lop: 'B' } as any);
        expect(mockClassRepo.updateClassCourse).toHaveBeenCalledWith(1, { ma_lop: 'B' });
    });

    it('should throw error when updating class course with missing ID', async () => {
        const useCase = new UpdateClassCourseUseCase(mockClassRepo);
        await expect(useCase.execute(0, { ma_lop: 'B' } as any)).rejects.toThrow("Missing class ID for update.");
    });

    it('should delete class course', async () => {
        const useCase = new DeleteClassCourseUseCase(mockClassRepo);
        await useCase.execute(1);
        expect(mockClassRepo.deleteClassCourse).toHaveBeenCalledWith(1);
    });

    it('should get classes by semester', async () => {
        mockClassRepo.getAllClassesBySemester.mockResolvedValue([]);
        const useCase = new GetAllClassesBySemesterUseCase(mockClassRepo);
        await useCase.execute(20231);
        expect(mockClassRepo.getAllClassesBySemester).toHaveBeenCalledWith(20231);
    });

    it('should get classes by course', async () => {
        mockClassRepo.getClassesByCourse.mockResolvedValue([]);
        const useCase = new GetClassesByCourseUseCase(mockClassRepo);
        await useCase.execute(20231, 101);
        expect(mockClassRepo.getClassesByCourse).toHaveBeenCalledWith(20231, 101);
    });

    it('should get course registration stats', async () => {
        mockAdminRepo.getCourseRegistrationStats.mockResolvedValue([]);
        const useCase = new GetCourseRegistrationStatsUseCase(mockAdminRepo);
        await useCase.execute(20231);
        expect(mockAdminRepo.getCourseRegistrationStats).toHaveBeenCalledWith(20231);
    });

    it('should get all academic periods', async () => {
        const mockPeriod = {
            id: 1,
            semester: 20231,
            semester_name: 1,
            period_type: 'hoc_phan',
            start_date: '2023-01-01',
            end_date: '2023-02-01',
            is_active: 1
        };
        mockAcademicRepo.getAll.mockResolvedValue([mockPeriod]);
        const useCase = new GetAllAcademicPeriodsUseCase(mockAcademicRepo);
        const result = await useCase.execute();
        expect(result).toEqual([mockPeriod]);
        expect(mockAcademicRepo.getAll).toHaveBeenCalled();
    });

    it('should save academic period', async () => {
        const useCase = new SaveAcademicPeriodUseCase(mockAcademicRepo);
        await useCase.execute({ semester: 20231 } as any);
        expect(mockAcademicRepo.save).toHaveBeenCalledWith(20231, undefined, undefined, undefined, undefined);
    });

    it('should delete academic period', async () => {
        const useCase = new DeleteAcademicPeriodUseCase(mockAcademicRepo);
        await useCase.execute(1);
        expect(mockAcademicRepo.delete).toHaveBeenCalledWith(1);
    });
});
