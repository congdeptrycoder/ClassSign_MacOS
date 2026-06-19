import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterCourseUseCase } from '../../../src/application/use-cases/RegisterCourseUseCase';
import { GetRegisteredCoursesUseCase } from '../../../src/application/use-cases/GetRegisteredCoursesUseCase';
import { StudentCourseRegistrationRepositoryImpl } from '../../../src/infrastructure/repositories/StudentCourseRegistrationRepositoryImpl';
import { apiClient } from '../../../src/infrastructure/api/apiClient';

vi.mock('../../../src/infrastructure/api/apiClient', () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
    }
}));

describe('Registration Frontend Integration Tests (UseCase + Repository)', () => {
    let registerCourseUseCase: RegisterCourseUseCase;
    let getRegisteredCoursesUseCase: GetRegisteredCoursesUseCase;
    let registrationRepository: StudentCourseRegistrationRepositoryImpl;

    beforeEach(() => {
        vi.clearAllMocks();
        registrationRepository = new StudentCourseRegistrationRepositoryImpl();
        registerCourseUseCase = new RegisterCourseUseCase(registrationRepository);
        getRegisteredCoursesUseCase = new GetRegisteredCoursesUseCase(registrationRepository);
    });

    it('should register for a course', async () => {
        const mockResponse = {
            course: {
                id: 1,
                courseId: 101,
                semester: 20231,
                status: 'registered',
                code: 'IT101',
                name: 'Intro IT',
                credits: 3
            },
            message: 'Đăng ký thành công'
        };

        (apiClient.post as any).mockResolvedValue(mockResponse);

        const result = await registerCourseUseCase.execute(1, 101);

        expect(apiClient.post).toHaveBeenCalledWith('/students/1/course-registrations', { courseId: 101 });
        expect(result.course.courseId).toBe(101);
        expect(result.message).toBe('Đăng ký thành công');
    });

    it('should get registered courses', async () => {
        const mockResponse = [
            {
                id: 1,
                courseId: 101,
                semester: 20231,
                status: 'registered',
                code: 'IT101',
                name: 'Intro IT',
                credits: 3
            }
        ];

        (apiClient.get as any).mockResolvedValue(mockResponse);

        const courses = await getRegisteredCoursesUseCase.execute(1);

        expect(apiClient.get).toHaveBeenCalledWith('/students/1/registered-courses');
        expect(courses.length).toBe(1);
        expect(courses[0].courseId).toBe(101);
    });
});
