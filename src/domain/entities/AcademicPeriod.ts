export class AcademicPeriod {
    constructor(
        public id: number,
        public semester: number,
        public semester_name: number,
        public period_type: string,
        public start_date: string,
        public end_date: string,
        public is_active: number,
    ) {}
}
