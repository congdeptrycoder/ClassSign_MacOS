import { IAdminClassRepository } from '../../domain/repositories/IAdminClassRepository';
import { apiClient } from '../api/apiClient';
import { SaveClassCourseInputDTO, ClassCourseOutputDTO } from '../../application/dto/AdminClassDTO';

export class AdminClassRepositoryImpl implements IAdminClassRepository {
    async createClassCourse(data: SaveClassCourseInputDTO): Promise<void> {
        await apiClient.post('/admin/classes', data);
    }

    async getClassesByCourse(semester: number, courseId: number): Promise<ClassCourseOutputDTO[]> {
        return await apiClient.get(`/admin/classes/${semester}/${courseId}`);
    }

    async getAllClassesBySemester(semester: number): Promise<ClassCourseOutputDTO[]> {
        return await apiClient.get(`/admin/classes/semester/${semester}`);
    }

    async updateClassCourse(id: number, data: SaveClassCourseInputDTO): Promise<void> {
        await apiClient.put(`/admin/classes/${id}`, data);
    }

    async deleteClassCourse(classId: number): Promise<void> {
        await apiClient.delete(`/admin/classes/${classId}`);
    }
}
