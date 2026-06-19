import { SaveClassCourseInputDTO, ClassCourseOutputDTO } from '../../application/dto/AdminClassDTO';

export interface IAdminClassRepository {
    createClassCourse(data: SaveClassCourseInputDTO): Promise<void>;
    getClassesByCourse(semester: number, courseId: number): Promise<ClassCourseOutputDTO[]>;
    getAllClassesBySemester(semester: number): Promise<ClassCourseOutputDTO[]>;
    updateClassCourse(id: number, data: SaveClassCourseInputDTO): Promise<void>;
    deleteClassCourse(classId: number): Promise<void>;
}
