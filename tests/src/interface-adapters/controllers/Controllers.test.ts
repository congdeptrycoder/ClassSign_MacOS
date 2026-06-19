import { describe, it, expect, vi } from 'vitest';
import { AcademicPeriodController } from '../../../../src/interface-adapters/controllers/AcademicPeriodController';
import { AdminClassController } from '../../../../src/interface-adapters/controllers/AdminClassController';
import { AdminController } from '../../../../src/interface-adapters/controllers/AdminController';
import { ClassRegistrationController } from '../../../../src/interface-adapters/controllers/ClassRegistrationController';
import { CourseRegistrationController } from '../../../../src/interface-adapters/controllers/CourseRegistrationController';
import { CurriculumController } from '../../../../src/interface-adapters/controllers/CurriculumController';
import { LoginController } from '../../../../src/interface-adapters/controllers/LoginController';
import { SemesterController } from '../../../../src/interface-adapters/controllers/SemesterController';
import { TimetableController } from '../../../../src/interface-adapters/controllers/TimetableController';

describe('Controllers Suite', () => {
  describe('AcademicPeriodController', () => {
    it('should forward calls to use cases', async () => {
      const mockGetAll = { execute: vi.fn().mockResolvedValue(['period1']) };
      const mockSave = { execute: vi.fn().mockResolvedValue('saved') };
      const mockDelete = { execute: vi.fn().mockResolvedValue('deleted') };

      const controller = new AcademicPeriodController(
        mockGetAll as any,
        mockSave as any,
        mockDelete as any
      );

      expect(await controller.getAll()).toEqual(['period1']);
      expect(mockGetAll.execute).toHaveBeenCalled();

      const input = { id: 1 } as any;
      expect(await controller.save(input)).toEqual('saved');
      expect(mockSave.execute).toHaveBeenCalledWith(input);

      expect(await controller.delete(5)).toEqual('deleted');
      expect(mockDelete.execute).toHaveBeenCalledWith(5);
    });
  });

  describe('AdminClassController', () => {
    it('should forward calls to use cases', async () => {
      const mockCreate = { execute: vi.fn().mockResolvedValue(undefined) };
      const mockGet = { execute: vi.fn().mockResolvedValue(['class1']) };
      const mockDelete = { execute: vi.fn().mockResolvedValue(undefined) };
      const mockGetAll = { execute: vi.fn().mockResolvedValue(['allClasses']) };
      const mockUpdate = { execute: vi.fn().mockResolvedValue(undefined) };

      const controller = new AdminClassController(
        mockCreate as any,
        mockGet as any,
        mockDelete as any,
        mockGetAll as any,
        mockUpdate as any
      );

      const data = { code: 'CS101' } as any;
      await controller.createClassCourse(data);
      expect(mockCreate.execute).toHaveBeenCalledWith(data);

      await controller.updateClassCourse(12, data);
      expect(mockUpdate.execute).toHaveBeenCalledWith(12, data);

      expect(await controller.getClassesByCourse(20231, 45)).toEqual(['class1']);
      expect(mockGet.execute).toHaveBeenCalledWith(20231, 45);

      expect(await controller.getAllClassesBySemester(20231)).toEqual(['allClasses']);
      expect(mockGetAll.execute).toHaveBeenCalledWith(20231);

      await controller.deleteClassCourse(78);
      expect(mockDelete.execute).toHaveBeenCalledWith(78);
    });
  });

  describe('AdminController', () => {
    it('should forward calls to use cases', async () => {
      const mockGetStats = { execute: vi.fn().mockResolvedValue(['stat1']) };
      const controller = new AdminController(mockGetStats as any);

      expect(await controller.getCourseRegistrationStats(20231)).toEqual(['stat1']);
      expect(mockGetStats.execute).toHaveBeenCalledWith(20231);
    });
  });

  describe('ClassRegistrationController', () => {
    it('should forward calls to use cases', async () => {
      const mockSearch = { execute: vi.fn().mockResolvedValue(['sug1']) };
      const mockRegister = { execute: vi.fn().mockResolvedValue({ success: true }) };
      const mockCancel = { execute: vi.fn().mockResolvedValue({ success: true }) };
      const mockGetClasses = { execute: vi.fn().mockResolvedValue(['class1']) };

      const controller = new ClassRegistrationController(
        mockSearch as any,
        mockRegister as any,
        mockCancel as any,
        mockGetClasses as any
      );

      expect(await controller.searchClassSuggestions(1, 'query')).toEqual(['sug1']);
      expect(mockSearch.execute).toHaveBeenCalledWith(1, 'query');

      expect(await controller.registerClass(1, 10)).toEqual({ success: true });
      expect(mockRegister.execute).toHaveBeenCalledWith(1, 10);

      expect(await controller.cancelClassRegistration(1, 10)).toEqual({ success: true });
      expect(mockCancel.execute).toHaveBeenCalledWith(1, 10);

      expect(await controller.getClassesForCourse(1, 20)).toEqual(['class1']);
      expect(mockGetClasses.execute).toHaveBeenCalledWith(1, 20);
    });
  });

  describe('CourseRegistrationController', () => {
    it('should forward calls to use cases', async () => {
      const mockGetReg = { execute: vi.fn().mockResolvedValue(['course1']) };
      const mockSearch = { execute: vi.fn().mockResolvedValue(['sug1']) };
      const mockRegister = { execute: vi.fn().mockResolvedValue({ success: true }) };
      const mockCancel = { execute: vi.fn().mockResolvedValue({ success: true }) };

      const controller = new CourseRegistrationController(
        mockGetReg as any,
        mockSearch as any,
        mockRegister as any,
        mockCancel as any
      );

      expect(await controller.getRegisteredCourses(1)).toEqual(['course1']);
      expect(mockGetReg.execute).toHaveBeenCalledWith(1);

      expect(await controller.searchCourseSuggestions(1, 'query')).toEqual(['sug1']);
      expect(mockSearch.execute).toHaveBeenCalledWith(1, 'query');

      expect(await controller.registerCourse(1, 10)).toEqual({ success: true });
      expect(mockRegister.execute).toHaveBeenCalledWith(1, 10);

      expect(await controller.cancelCourseRegistration(1, 10)).toEqual({ success: true });
      expect(mockCancel.execute).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('CurriculumController', () => {
    it('should forward calls to use cases', async () => {
      const mockGetCurriculum = { execute: vi.fn().mockResolvedValue(['curriculum']) };
      const controller = new CurriculumController(mockGetCurriculum as any);

      expect(await controller.getCurriculum(1)).toEqual(['curriculum']);
      expect(mockGetCurriculum.execute).toHaveBeenCalledWith(1);
    });
  });

  describe('LoginController', () => {
    it('should return success response on valid login', async () => {
      const mockAccount = { id: 1, username: 'test', role: 'student' };
      const mockUseCase = { execute: vi.fn().mockResolvedValue(mockAccount) };
      const controller = new LoginController(mockUseCase as any);

      const res = await controller.login('test', 'pass');
      expect(res).toEqual({ success: true, account: mockAccount });
      expect(mockUseCase.execute).toHaveBeenCalledWith('test', 'pass');
    });

    it('should return error response on exception', async () => {
      const mockUseCase = { execute: vi.fn().mockRejectedValue(new Error('Auth failed')) };
      const controller = new LoginController(mockUseCase as any);

      const res = await controller.login('test', 'pass');
      expect(res).toEqual({ success: false, message: 'Auth failed' });
    });
  });

  describe('SemesterController', () => {
    it('should forward calls to use cases', async () => {
      const mockGetAll = { execute: vi.fn().mockResolvedValue(['sem1']) };
      const mockCreate = { execute: vi.fn().mockResolvedValue('created') };

      const controller = new SemesterController(mockGetAll as any, mockCreate as any);

      expect(await controller.getAllSemesters()).toEqual(['sem1']);
      expect(mockGetAll.execute).toHaveBeenCalled();

      expect(await controller.createSemester('20231')).toEqual('created');
      expect(mockCreate.execute).toHaveBeenCalledWith('20231');
    });
  });

  describe('TimetableController', () => {
    it('should forward calls to use cases', async () => {
      const mockGetTimetable = { execute: vi.fn().mockResolvedValue(['timetable']) };
      const controller = new TimetableController(mockGetTimetable as any);

      expect(await controller.getTimetable(1)).toEqual(['timetable']);
      expect(mockGetTimetable.execute).toHaveBeenCalledWith(1);
    });
  });
});
