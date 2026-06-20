export class CourseRegistrationStat {
    constructor(
        public readonly courseId: number,
        public readonly courseCode: string,
        public readonly courseName: string,
        public readonly departmentName: string,
        public readonly registrationCount: number,
        public readonly classCount: number,
        public readonly maxRegistrationCount: number
    ) {}

    getFillRate(): number {
        if (this.maxRegistrationCount <= 0) return 0;
        return Math.round((this.registrationCount / this.maxRegistrationCount) * 100);
    }

    isFull(): boolean {
        return this.registrationCount >= this.maxRegistrationCount && this.maxRegistrationCount > 0;
    }
}
