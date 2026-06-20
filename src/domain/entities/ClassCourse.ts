export interface SaveClassCourseInputDTO {
    id?: number;
    semester: string | number;
    departmentName: string;
    courseCode: string;
    courseName: string;
    classCode: string;
    subClassCode: string;
    notes: string;
    dayOfWeek: string;
    startPeriod: string;
    endPeriod: string;
    daySession: string;
    room: string;
    requiresExperiment: string;
    maxSlots: string | number;
    teachingType: string;
}

export interface ClassCourseOutputDTO {
    id: number;
    courseId?: number;
    semester?: number;
    detail?: string;
    classCode?: string;
    subClassCode?: string;
    notes?: string;
    dayOfWeek?: string;
    startPeriod?: string;
    endPeriod?: string;
    daySession?: string;
    room?: string;
    requiresExperiment?: string;
    maxSlots?: number;
    occupiedSlots?: number;
    teachingType?: string;
    totalSlots?: number;
    courseCode?: string;
    courseName?: string;
    credits?: string;
    departmentName?: string;
}
