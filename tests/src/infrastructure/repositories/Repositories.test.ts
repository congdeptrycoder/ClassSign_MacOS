import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StudentCourseRegistrationRepositoryImpl } from '../../../../src/infrastructure/repositories/StudentCourseRegistrationRepositoryImpl';
import { AdminClassRepositoryImpl } from '../../../../src/infrastructure/repositories/AdminClassRepositoryImpl';
import { AdminRepositoryImpl } from '../../../../src/infrastructure/repositories/AdminRepositoryImpl';
import { AcademicPeriodRepositoryImpl } from '../../../../src/infrastructure/repositories/AcademicPeriodRepositoryImpl';
import { StudentTimetableRepositoryImpl } from '../../../../src/infrastructure/repositories/StudentTimetableRepositoryImpl';
import { AccountRepositoryImpl } from '../../../../src/infrastructure/repositories/AccountRepositoryImpl';
import { SemesterRepositoryImpl } from '../../../../src/infrastructure/repositories/SemesterRepositoryImpl';
import { StudentClassRegistrationRepositoryImpl } from '../../../../src/infrastructure/repositories/StudentClassRegistrationRepositoryImpl';
import { apiClient } from '../../../../src/infrastructure/api/apiClient';

vi.mock('../../../../src/infrastructure/api/apiClient', () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
    }
}));

describe('Repositories Integration/Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (apiClient.get as any).mockReset().mockResolvedValue([]);
        (apiClient.post as any).mockReset().mockResolvedValue({});
        (apiClient.put as any).mockReset().mockResolvedValue({});
        (apiClient.delete as any).mockReset().mockResolvedValue({});
    });

    describe('StudentCourseRegistrationRepositoryImpl', () => {
        let repo: StudentCourseRegistrationRepositoryImpl;
        beforeEach(() => repo = new StudentCourseRegistrationRepositoryImpl());

        it('should get curriculum', async () => {
            await repo.getCurriculum(1);
            expect(apiClient.get).toHaveBeenCalledWith('/students/1/curriculum');
        });

        it('should get registered courses', async () => {
            await repo.getRegisteredCourses(1);
            expect(apiClient.get).toHaveBeenCalledWith('/students/1/registered-courses');
        });

        it('should search course suggestions', async () => {
            await repo.searchCourseSuggestions(1, 'IT');
            expect(apiClient.get).toHaveBeenCalledWith('/students/1/course-suggestions?q=IT');
        });

        it('should register course', async () => {
            await repo.registerCourse(1, 101);
            expect(apiClient.post).toHaveBeenCalledWith('/students/1/course-registrations', { courseId: 101 });
        });

        it('should cancel course registration', async () => {
            await repo.cancelCourseRegistration(1, 101);
            expect(apiClient.delete).toHaveBeenCalledWith('/students/1/course-registrations/101');
        });
    });

    describe('AdminClassRepositoryImpl', () => {
        let repo: AdminClassRepositoryImpl;
        beforeEach(() => repo = new AdminClassRepositoryImpl());

        it('should create class', async () => {
            await repo.createClassCourse({ ma_lop: 'A' } as any);
            expect(apiClient.post).toHaveBeenCalledWith('/admin/classes', { ma_lop: 'A' });
        });

        it('should update class', async () => {
            await repo.updateClassCourse(1, { ma_lop: 'B' } as any);
            expect(apiClient.put).toHaveBeenCalledWith('/admin/classes/1', { ma_lop: 'B' });
        });

        it('should delete class', async () => {
            await repo.deleteClassCourse(1);
            expect(apiClient.delete).toHaveBeenCalledWith('/admin/classes/1');
        });

        it('should get classes by semester', async () => {
            (apiClient.get as any).mockResolvedValue([]);
            await repo.getAllClassesBySemester(20231);
            expect(apiClient.get).toHaveBeenCalledWith('/admin/classes/semester/20231');
        });

        it('should get classes by course', async () => {
            await repo.getClassesByCourse(20231, 101);
            expect(apiClient.get).toHaveBeenCalledWith('/admin/classes/20231/101');
        });
    });

    describe('AdminRepositoryImpl', () => {
        let repo: AdminRepositoryImpl;
        beforeEach(() => repo = new AdminRepositoryImpl());

        it('should get stats', async () => {
            (apiClient.get as any).mockResolvedValue([]);
            await repo.getCourseRegistrationStats(20231);
            expect(apiClient.get).toHaveBeenCalledWith('/admin/course-registration-stats?semester=20231');
        });

        it('should handle get stats error', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            (apiClient.get as any).mockRejectedValue(new Error('Stats failed'));

            await expect(repo.getCourseRegistrationStats(20231)).rejects.toThrow('Stats failed');
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });

        it('should handle get stats error fallback', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            (apiClient.get as any).mockRejectedValue({});

            await expect(repo.getCourseRegistrationStats(20231)).rejects.toThrow('Lỗi kết nối tới máy chủ.');
            consoleSpy.mockRestore();
        });
    });

    describe('AcademicPeriodRepositoryImpl', () => {
        let repo: AcademicPeriodRepositoryImpl;
        beforeEach(() => repo = new AcademicPeriodRepositoryImpl());

        it('should get all periods', async () => {
            await repo.getAll();
            expect(apiClient.get).toHaveBeenCalledWith('/academic-periods');
        });

        it('should handle get all periods error', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            (apiClient.get as any).mockRejectedValue(new Error('Periods failed'));

            await expect(repo.getAll()).rejects.toThrow('Periods failed');
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });

        it('should handle get all periods error fallback', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            (apiClient.get as any).mockRejectedValue({});

            await expect(repo.getAll()).rejects.toThrow('Lỗi kết nối tới máy chủ.');
            consoleSpy.mockRestore();
        });

        it('should save period - update', async () => {
            await repo.save(20231, 'hoc_phan', '2023-01-01', '2023-06-01', 1);
            expect(apiClient.put).toHaveBeenCalledWith('/academic-periods/1', { semester: 20231, period_type: 'hoc_phan', start_date: '2023-01-01', end_date: '2023-06-01' });
        });

        it('should save period - create', async () => {
            (apiClient.post as any).mockResolvedValue({ id: 1 });
            await repo.save(20231, 'hoc_phan', '2023-01-01', '2023-06-01');
            expect(apiClient.post).toHaveBeenCalledWith('/academic-periods', { semester: 20231, period_type: 'hoc_phan', start_date: '2023-01-01', end_date: '2023-06-01' });
        });

        it('should handle save period error', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            (apiClient.post as any).mockRejectedValue(new Error('Save failed'));

            await expect(repo.save(20231, 'hoc_phan', '2023-01-01', '2023-06-01')).rejects.toThrow('Save failed');
            consoleSpy.mockRestore();
        });

        it('should handle save period error fallback', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            (apiClient.post as any).mockRejectedValue({});

            await expect(repo.save(20231, 'hoc_phan', '2023-01-01', '2023-06-01')).rejects.toThrow('Lỗi kết nối tới máy chủ.');
            consoleSpy.mockRestore();
        });

        it('should delete period', async () => {
            await repo.delete(1);
            expect(apiClient.delete).toHaveBeenCalledWith('/academic-periods/1');
        });

        it('should handle delete period error', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            (apiClient.delete as any).mockRejectedValue(new Error('Delete failed'));

            await expect(repo.delete(1)).rejects.toThrow('Delete failed');
            consoleSpy.mockRestore();
        });

        it('should handle delete period error fallback', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            (apiClient.delete as any).mockRejectedValue({});

            await expect(repo.delete(1)).rejects.toThrow('Lỗi kết nối tới máy chủ.');
            consoleSpy.mockRestore();
        });
    });

    describe('StudentTimetableRepositoryImpl', () => {
        let repo: StudentTimetableRepositoryImpl;
        beforeEach(() => repo = new StudentTimetableRepositoryImpl());

        it('should get timetable', async () => {
            await repo.getTimetable(1);
            expect(apiClient.get).toHaveBeenCalledWith('/students/1/timetable');
        });
    });

    describe('AccountRepositoryImpl', () => {
        let repo: AccountRepositoryImpl;
        beforeEach(() => repo = new AccountRepositoryImpl());

        it('should login successfully', async () => {
            const mockResponse = {
                user: {
                    id: 1,
                    username: 'std1',
                    name: 'Student 1',
                    role: 'student',
                    id_card: '123',
                    status: 'active'
                }
            };
            (apiClient.post as any).mockResolvedValue(mockResponse);

            const result = await repo.login('std1', 'pass');
            expect(apiClient.post).toHaveBeenCalledWith('/auth/login', { username: 'std1', password: 'pass' });
            expect(result).not.toBeNull();
            expect(result?.id).toBe(1);
            expect(result?.username).toBe('std1');
        });

        it('should handle login failure and format error message', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            (apiClient.post as any).mockRejectedValue(new Error('Unauthorized'));

            await expect(repo.login('std1', 'pass')).rejects.toThrow('Unauthorized');
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });

        it('should fallback to default error message if error has no message', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            (apiClient.post as any).mockRejectedValue({});

            await expect(repo.login('std1', 'pass')).rejects.toThrow('Lỗi kết nối tới máy chủ.');
            consoleSpy.mockRestore();
        });
    });

    describe('SemesterRepositoryImpl', () => {
        let repo: SemesterRepositoryImpl;
        beforeEach(() => repo = new SemesterRepositoryImpl());

        it('should get all semesters', async () => {
            const mockSemesters = [{ id: 1, semester: 20231, is_active: 1 }];
            (apiClient.get as any).mockResolvedValue(mockSemesters);

            const result = await repo.getAll();
            expect(apiClient.get).toHaveBeenCalledWith('/semesters');
            expect(result.length).toBe(1);
            expect(result[0].id).toBe(1);
            expect(result[0].semester).toBe(20231);
        });

        it('should handle getAll error', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            (apiClient.get as any).mockRejectedValue(new Error('Load error'));

            await expect(repo.getAll()).rejects.toThrow('Load error');
            consoleSpy.mockRestore();
        });

        it('should create semester successfully', async () => {
            (apiClient.post as any).mockResolvedValue({});

            await repo.createSemester('20232');
            expect(apiClient.post).toHaveBeenCalledWith('/semesters', { semester: '20232' });
        });

        it('should handle createSemester error and return message', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            (apiClient.post as any).mockRejectedValue({
                response: {
                    data: {
                        message: 'Semester exists'
                    }
                }
            });

            await expect(repo.createSemester('20232')).rejects.toThrow('Semester exists');
            consoleSpy.mockRestore();
        });

        it('should handle createSemester error fallback', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            (apiClient.post as any).mockRejectedValue({});

            await expect(repo.createSemester('20232')).rejects.toThrow('Lỗi thêm học kỳ.');
            consoleSpy.mockRestore();
        });
    });

    describe('StudentClassRegistrationRepositoryImpl', () => {
        let repo: StudentClassRegistrationRepositoryImpl;
        beforeEach(() => repo = new StudentClassRegistrationRepositoryImpl());

        it('should search class suggestions', async () => {
            await repo.searchClassSuggestions(1, 'IT');
            expect(apiClient.get).toHaveBeenCalledWith('/students/1/class-suggestions?q=IT');
        });

        it('should register class', async () => {
            await repo.registerClass(1, 101);
            expect(apiClient.post).toHaveBeenCalledWith('/students/1/class-registrations', { classId: 101 });
        });

        it('should cancel class registration', async () => {
            await repo.cancelClassRegistration(1, 101);
            expect(apiClient.delete).toHaveBeenCalledWith('/students/1/class-registrations/101');
        });

        it('should get classes for course', async () => {
            await repo.getClassesForCourse(1, 202);
            expect(apiClient.get).toHaveBeenCalledWith('/students/1/courses/202/classes');
        });
    });
});
