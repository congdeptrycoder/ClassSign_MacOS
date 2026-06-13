import { Request, Response } from 'express';
import { AdminService } from './admin.service';
import { sendSuccess, sendError } from '../httpResponse';

const adminService = new AdminService();

export const getCourseRegistrationStats = async (req: Request, res: Response) => {
    try {
        const semester = Number(req.query.semester);
        if (!semester) {
            return sendError(res, 400, 'Thiếu tham số semester');
        }
        
        const stats = await adminService.getCourseRegistrationStats(semester);
        sendSuccess(res, stats, 'Lấy thống kê thành công', 200);
    } catch (error: any) {
        sendError(res, 500, error.message || 'Lỗi hệ thống');
    }
};

export const createClassCourse = async (req: Request, res: Response) => {
    try {
        const data = req.body;
        if (!data.ky || !data.ma_hp || !data.ma_lop || !data.sl_max) {
            return sendError(res, 400, 'Thiếu thông tin bắt buộc (kỳ học, mã HP, mã lớp, SL Max)');
        }
        
        await adminService.createClassCourse(data);
        sendSuccess(res, null, 'Tạo lớp học thành công', 201);
    } catch (error: any) {
        sendError(res, 500, error.message || 'Lỗi hệ thống khi tạo lớp học');
    }
};

export const updateClassCourse = async (req: Request, res: Response) => {
    try {
        const classId = Number(req.params.id);
        const data = req.body;
        if (!classId || !data.ma_lop || !data.sl_max) {
            return sendError(res, 400, 'Thiếu thông tin bắt buộc (ID lớp, mã lớp, SL Max)');
        }
        
        await adminService.updateClassCourse(classId, data);
        sendSuccess(res, null, 'Cập nhật lớp học thành công', 200);
    } catch (error: any) {
        sendError(res, 500, error.message || 'Lỗi hệ thống khi cập nhật lớp học');
    }
};

export const getClassesByCourse = async (req: Request, res: Response) => {
    try {
        const semester = Number(req.params.semester);
        const courseId = Number(req.params.courseId);
        if (!semester || !courseId) {
            return sendError(res, 400, 'Thiếu tham số bắt buộc');
        }
        
        const classes = await adminService.getClassesByCourse(semester, courseId);
        sendSuccess(res, classes, 'Lấy danh sách lớp thành công', 200);
    } catch (error: any) {
        sendError(res, 500, error.message || 'Lỗi hệ thống');
    }
};

export const deleteClassCourse = async (req: Request, res: Response) => {
    try {
        const classId = Number(req.params.id);
        if (!classId) {
            return sendError(res, 400, 'Thiếu ID lớp học');
        }
        
        await adminService.deleteClassCourse(classId);
        sendSuccess(res, null, 'Xoá lớp học thành công', 200);
    } catch (error: any) {
        sendError(res, 500, error.message || 'Lỗi hệ thống khi xoá lớp học');
    }
};

export const getAllClassesBySemester = async (req: Request, res: Response) => {
    try {
        const semester = Number(req.params.semester);
        if (!semester) {
            return sendError(res, 400, 'Thiếu tham số kỳ học');
        }
        
        const classes = await adminService.getAllClassesBySemester(semester);
        sendSuccess(res, classes, 'Lấy toàn bộ danh sách lớp thành công', 200);
    } catch (error: any) {
        sendError(res, 500, error.message || 'Lỗi hệ thống');
    }
};
