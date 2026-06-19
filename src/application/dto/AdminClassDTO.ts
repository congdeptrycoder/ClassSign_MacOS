export interface SaveClassCourseInputDTO {
    id?: number;
    ky: string | number;
    truong_khoa: string;
    ma_hp: string;
    ten_hp: string;
    ma_lop: string;
    ma_lop_kem: string;
    ghi_chu: string;
    thu: string;
    tiet_bd: string;
    tiet_kt: string;
    buoi: string;
    phong_hoc: string;
    can_tn: string;
    sl_max: string | number;
    teaching_type: string;
}

export interface ClassCourseOutputDTO {
    id: number;
    course_id?: number;
    semester?: number;
    detail?: string;
    ma_lop?: string;
    ma_lop_kem?: string;
    ghi_chu?: string;
    thu?: string;
    tiet_bd?: string;
    tiet_kt?: string;
    buoi?: string;
    phong_hoc?: string;
    can_tn?: string;
    sl_max?: number;
    sl_dk?: number;
    teaching_type?: string;
    occupiedSlots?: number;
    totalSlots?: number;
}
