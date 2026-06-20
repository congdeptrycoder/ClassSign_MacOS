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

    isCurrentlyActive(): boolean {
        if (this.is_active !== 1) return false;
        const today = new Date();
        const start = new Date(this.start_date);
        const end = new Date(this.end_date);
        
        // Zero out times for date comparison
        today.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        
        return today >= start && today <= end;
    }

    getDaysRemaining(): number {
        const today = new Date();
        const end = new Date(this.end_date);
        today.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        
        const diffTime = end.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays < 0 ? 0 : diffDays;
    }
}
