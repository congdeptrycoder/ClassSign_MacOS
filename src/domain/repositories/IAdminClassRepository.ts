export interface IAdminClassRepository {
    createClassCourse(data: any): Promise<void>;
    getClassesByCourse(semester: number, courseId: number): Promise<any[]>;
    getAllClassesBySemester(semester: number): Promise<any[]>;
    updateClassCourse(id: number, data: any): Promise<void>;
    deleteClassCourse(classId: number): Promise<void>;
}
