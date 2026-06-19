import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterClassUseCase } from '../../../../src/application/use-cases/RegisterClassUseCase';
import { RegisterCourseUseCase } from '../../../../src/application/use-cases/RegisterCourseUseCase';
import { CancelClassRegistrationUseCase } from '../../../../src/application/use-cases/CancelClassRegistrationUseCase';
import { CancelCourseRegistrationUseCase } from '../../../../src/application/use-cases/CancelCourseRegistrationUseCase';
import { GetCurriculumUseCase } from '../../../../src/application/use-cases/GetCurriculumUseCase';
import { SearchClassSuggestionsUseCase } from '../../../../src/application/use-cases/SearchClassSuggestionsUseCase';
import { SearchCourseSuggestionsUseCase } from '../../../../src/application/use-cases/SearchCourseSuggestionsUseCase';
import { GetClassesForCourseUseCase } from '../../../../src/application/use-cases/GetClassesForCourseUseCase';
import { GetTimetableUseCase } from '../../../../src/application/use-cases/GetTimetableUseCase';

describe('Course Registration Use Cases', () => {
    let mockRepo: any;

    beforeEach(() => {
        mockRepo = {
            registerCourse: vi.fn(),
            cancelCourseRegistration: vi.fn(),
            getCurriculum: vi.fn(),
            searchCourseSuggestions: vi.fn()
        };
    });

    it('should register course', async () => {
        mockRepo.registerCourse.mockResolvedValue({ message: 'Success' });
        const useCase = new RegisterCourseUseCase(mockRepo);
        await useCase.execute(1, 101);
        expect(mockRepo.registerCourse).toHaveBeenCalledWith(1, 101);
    });

    it('should cancel course', async () => {
        const useCase = new CancelCourseRegistrationUseCase(mockRepo);
        await useCase.execute(1, 101);
        expect(mockRepo.cancelCourseRegistration).toHaveBeenCalledWith(1, 101);
    });

    it('should get curriculum', async () => {
        mockRepo.getCurriculum.mockResolvedValue({ courses: [] });
        const useCase = new GetCurriculumUseCase(mockRepo);
        const result = await useCase.execute(1);
        expect(result).toEqual({ courses: [] });
        expect(mockRepo.getCurriculum).toHaveBeenCalledWith(1);
    });

    it('should search course suggestions', async () => {
        mockRepo.searchCourseSuggestions.mockResolvedValue([]);
        const useCase = new SearchCourseSuggestionsUseCase(mockRepo);
        const result = await useCase.execute(1, 'IT');
        expect(result).toEqual([]);
        expect(mockRepo.searchCourseSuggestions).toHaveBeenCalledWith(1, 'IT');
    });

    it('should return empty array for empty course suggestion query', async () => {
        const useCase = new SearchCourseSuggestionsUseCase(mockRepo);
        const result = await useCase.execute(1, '   ');
        expect(result).toEqual([]);
        expect(mockRepo.searchCourseSuggestions).not.toHaveBeenCalled();
    });
});

describe('Class Registration Use Cases', () => {
    let mockRepo: any;

    beforeEach(() => {
        mockRepo = {
            registerClass: vi.fn(),
            cancelClassRegistration: vi.fn(),
            getClassesForCourse: vi.fn(),
            searchClassSuggestions: vi.fn(),
            getTimetable: vi.fn()
        };
    });

    it('should register class', async () => {
        mockRepo.registerClass.mockResolvedValue({ id: 1 });
        const useCase = new RegisterClassUseCase(mockRepo);
        await useCase.execute(1, 202);
        expect(mockRepo.registerClass).toHaveBeenCalledWith(1, 202);
    });

    it('should cancel class', async () => {
        const useCase = new CancelClassRegistrationUseCase(mockRepo);
        await useCase.execute(1, 202);
        expect(mockRepo.cancelClassRegistration).toHaveBeenCalledWith(1, 202);
    });

    it('should get classes for course', async () => {
        mockRepo.getClassesForCourse.mockResolvedValue([]);
        const useCase = new GetClassesForCourseUseCase(mockRepo);
        await useCase.execute(1, 101);
        expect(mockRepo.getClassesForCourse).toHaveBeenCalledWith(1, 101);
    });

    it('should search class suggestions', async () => {
        mockRepo.searchClassSuggestions.mockResolvedValue([]);
        const useCase = new SearchClassSuggestionsUseCase(mockRepo);
        await useCase.execute(1, 'IT');
        expect(mockRepo.searchClassSuggestions).toHaveBeenCalledWith(1, 'IT');
    });

    it('should return empty array for empty class suggestion query', async () => {
        const useCase = new SearchClassSuggestionsUseCase(mockRepo);
        const result = await useCase.execute(1, '   ');
        expect(result).toEqual([]);
        expect(mockRepo.searchClassSuggestions).not.toHaveBeenCalled();
    });

    it('should get timetable', async () => {
        mockRepo.getTimetable.mockResolvedValue([]);
        const useCase = new GetTimetableUseCase(mockRepo);
        await useCase.execute(1);
        expect(mockRepo.getTimetable).toHaveBeenCalledWith(1);
    });
});
