import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateSemesterUseCase } from '../../../src/application/use-cases/CreateSemesterUseCase';
import { GetAllSemestersUseCase } from '../../../src/application/use-cases/GetAllSemestersUseCase';
import { SemesterRepositoryImpl } from '../../../src/infrastructure/repositories/SemesterRepositoryImpl';
import { apiClient } from '../../../src/infrastructure/api/apiClient';

vi.mock('../../../src/infrastructure/api/apiClient', () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
    }
}));

describe('Admin Frontend Integration Tests (UseCase + Repository)', () => {
    let createSemesterUseCase: CreateSemesterUseCase;
    let getAllSemestersUseCase: GetAllSemestersUseCase;
    let semesterRepository: SemesterRepositoryImpl;

    beforeEach(() => {
        vi.clearAllMocks();
        semesterRepository = new SemesterRepositoryImpl();
        createSemesterUseCase = new CreateSemesterUseCase(semesterRepository);
        getAllSemestersUseCase = new GetAllSemestersUseCase(semesterRepository);
    });

    it('should get all semesters', async () => {
        const mockResponse = [
            { id: 1, semester: 20231, is_active: 1 },
            { id: 2, semester: 20232, is_active: 0 }
        ];

        (apiClient.get as any).mockResolvedValue(mockResponse);

        const semesters = await getAllSemestersUseCase.execute();

        expect(apiClient.get).toHaveBeenCalledWith('/semesters');
        expect(semesters.length).toBe(2);
        expect(semesters[0].semester).toBe(20231);
        expect(semesters[1].semester).toBe(20232);
    });

    it('should create a new semester', async () => {
        (apiClient.post as any).mockResolvedValue(null);

        await createSemesterUseCase.execute('20241');

        expect(apiClient.post).toHaveBeenCalledWith('/semesters', { semester: '20241' });
    });

    it('should throw error when creating semester with empty code', async () => {
        await expect(createSemesterUseCase.execute('')).rejects.toThrow('Mã kỳ không được để trống.');
        await expect(createSemesterUseCase.execute('   ')).rejects.toThrow('Mã kỳ không được để trống.');
    });
});
