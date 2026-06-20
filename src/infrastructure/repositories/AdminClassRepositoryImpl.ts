import { IAdminClassRepository } from '../../domain/repositories/IAdminClassRepository';
import { apiClient } from '../api/apiClient';
import { SaveClassCourseInputDTO, ClassCourseOutputDTO } from '../../domain/entities/ClassCourse';
import { Logger } from '../../shared/utils/logger';

export class AdminClassRepositoryImpl implements IAdminClassRepository {
    async createClassCourse(data: SaveClassCourseInputDTO): Promise<void> {
        try {
            const payload = {
                ky: data.semester,
                truong_khoa: data.departmentName,
                ma_hp: data.courseCode,
                ten_hp: data.courseName,
                ma_lop: data.classCode,
                ma_lop_kem: data.subClassCode,
                ghi_chu: data.notes,
                thu: data.dayOfWeek,
                tiet_bd: data.startPeriod,
                tiet_kt: data.endPeriod,
                buoi: data.daySession,
                phong_hoc: data.room,
                can_tn: data.requiresExperiment,
                sl_max: data.maxSlots,
                teaching_type: data.teachingType
            };
            await apiClient.post('/admin/classes', payload);
        } catch (error: any) {
            Logger.error('AdminClassRepositoryImpl createClassCourse error: ' + (error.message || ''));
            throw new Error(error.message || 'Lỗi hệ thống khi tạo lớp học.');
        }
    }

    async getClassesByCourse(semester: number, courseId: number): Promise<ClassCourseOutputDTO[]> {
        try {
            const data: any[] = await apiClient.get(`/admin/classes/${semester}/${courseId}`);
            return data.map(item => this.mapToOutputDTO(item));
        } catch (error: any) {
            Logger.error('AdminClassRepositoryImpl getClassesByCourse error: ' + (error.message || ''));
            throw new Error(error.message || 'Lỗi hệ thống khi lấy danh sách lớp học.');
        }
    }

    async getAllClassesBySemester(semester: number): Promise<ClassCourseOutputDTO[]> {
        try {
            const data: any[] = await apiClient.get(`/admin/classes/semester/${semester}`);
            return data.map(item => this.mapToOutputDTO(item));
        } catch (error: any) {
            Logger.error('AdminClassRepositoryImpl getAllClassesBySemester error: ' + (error.message || ''));
            throw new Error(error.message || 'Lỗi hệ thống khi lấy toàn bộ danh sách lớp học.');
        }
    }

    async updateClassCourse(id: number, data: SaveClassCourseInputDTO): Promise<void> {
        try {
            const payload = {
                ma_lop: data.classCode,
                ma_lop_kem: data.subClassCode,
                ghi_chu: data.notes,
                thu: data.dayOfWeek,
                tiet_bd: data.startPeriod,
                tiet_kt: data.endPeriod,
                buoi: data.daySession,
                phong_hoc: data.room,
                can_tn: data.requiresExperiment,
                sl_max: data.maxSlots,
                teaching_type: data.teachingType
            };
            await apiClient.put(`/admin/classes/${id}`, payload);
        } catch (error: any) {
            Logger.error('AdminClassRepositoryImpl updateClassCourse error: ' + (error.message || ''));
            throw new Error(error.message || 'Lỗi hệ thống khi cập nhật lớp học.');
        }
    }

    async deleteClassCourse(classId: number): Promise<void> {
        try {
            await apiClient.delete(`/admin/classes/${classId}`);
        } catch (error: any) {
            Logger.error('AdminClassRepositoryImpl deleteClassCourse error: ' + (error.message || ''));
            throw new Error(error.message || 'Lỗi hệ thống khi xoá lớp học.');
        }
    }

    private mapToOutputDTO(item: any): ClassCourseOutputDTO {
        return {
            id: item.id,
            courseId: item.course_id,
            semester: item.ky ? Number(item.ky) : undefined,
            detail: item.detail,
            classCode: item.ma_lop,
            subClassCode: item.ma_lop_kem,
            notes: item.ghi_chu,
            dayOfWeek: item.thu,
            startPeriod: item.tiet_bd,
            endPeriod: item.tiet_kt,
            daySession: item.buoi,
            room: item.phong_hoc,
            requiresExperiment: item.can_tn,
            maxSlots: item.sl_max,
            occupiedSlots: item.sl_dk,
            teachingType: item.teaching_type,
            totalSlots: item.sl_max,
            courseCode: item.ma_hp,
            courseName: item.ten_hp,
            credits: item.khoi_luong?.toString(),
            departmentName: item.khoa_truong
        };
    }
}
