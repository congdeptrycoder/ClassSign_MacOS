export class Semester {
    constructor(
        public id: number,
        public semester: number,
        public is_active: number,
    ) {}

    getAcademicYear(): string {
        const semStr = this.semester.toString();
        if (semStr.length >= 4) {
            const startYear = parseInt(semStr.substring(0, 4), 10);
            return `${startYear}-${startYear + 1}`;
        }
        return 'N/A';
    }

    getSemesterNumber(): number {
        const semStr = this.semester.toString();
        if (semStr.length >= 5) {
            return parseInt(semStr.charAt(4), 10);
        }
        return 1;
    }
}
