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
