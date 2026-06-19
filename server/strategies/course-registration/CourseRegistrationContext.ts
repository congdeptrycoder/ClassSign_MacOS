export interface CourseRegistrationContext {
    studentId: number;
    targetCourseId: number;
    isAutoAdd: boolean;
    activePeriod: any;
    courseMap: Map<number, any>;
    curriculumCourse?: any;
}

export class SkipValidationException extends Error {
    constructor() {
        super('SKIP');
        this.name = 'SkipValidationException';
    }
}
