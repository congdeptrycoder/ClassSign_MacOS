export interface AcademicPeriodDTO {
    id: number;
    semester: number;
    semester_name: number;
    period_type: string;
    start_date: string;
    end_date: string;
    is_active: number;
}

export interface SaveAcademicPeriodInputDTO {
    semester: number;
    period_type: string;
    start_date: string;
    end_date: string;
}
