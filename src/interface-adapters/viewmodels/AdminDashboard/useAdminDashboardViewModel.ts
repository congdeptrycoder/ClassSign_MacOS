import React, { useState, useEffect } from 'react';
import { filterTableByColumn } from '../../../shared/utils/FilterTableByColumn';

import { SemesterRepositoryImpl } from '../../../infrastructure/repositories/SemesterRepositoryImpl';
import { AcademicPeriodRepositoryImpl } from '../../../infrastructure/repositories/AcademicPeriodRepositoryImpl';
import { GetAllSemestersUseCase } from '../../../application/use-cases/GetAllSemestersUseCase';
import { GetAllAcademicPeriodsUseCase } from '../../../application/use-cases/GetAllAcademicPeriodsUseCase';
import { SaveAcademicPeriodUseCase } from '../../../application/use-cases/SaveAcademicPeriodUseCase';
import { DeleteAcademicPeriodUseCase } from '../../../application/use-cases/DeleteAcademicPeriodUseCase';
import { SemesterController } from '../../controllers/SemesterController';
import { AcademicPeriodController } from '../../controllers/AcademicPeriodController';
import { AcademicPeriodDTO } from '../../../application/dto/AcademicPeriodDTO';
import { SemesterDTO } from '../../../application/dto/SemesterDTO';
import { AdminClassRepositoryImpl } from '../../../infrastructure/repositories/AdminClassRepositoryImpl';
import { GetAllClassesBySemesterUseCase } from '../../../application/use-cases/GetAllClassesBySemesterUseCase';
import { DeleteClassCourseUseCase } from '../../../application/use-cases/DeleteClassCourseUseCase';
import { AdminClassController } from '../../controllers/AdminClassController';
import { CreateClassCourseUseCase } from '../../../application/use-cases/CreateClassCourseUseCase';


export interface ClassInfo {
    ky: string;
    khoa_truong: string;
    ma_lop: string;
    ma_lop_kem: string;
    ma_hp: string;
    ten_hp: string;
    khoi_luong: string;
    ghi_chu: string;
    thu: string;
    tiet_bd: string;
    tiet_kt: string;
    buoi: string;
    phong_hoc: string;
    can_tn: string;
    sl_dk: string;
    sl_max: string;
    trang_thai: string;
    teaching_type: string;
}

const majorMapping: Record<string, string[]> = {
    'Trường CNTT & TT': [
        'KHMT',
        'KTPM',
        'HTTT',
        'An toàn TT',
        'Trí tuệ nhân tạo',
        'Khoa học Dữ liệu',
    ],
    'Trường Điện - Điện tử': [
        'Kỹ thuật Điện',
        'Kỹ thuật Điều khiển',
        'Điện tử viễn thông',
    ],
    'Trường Cơ khí': ['Cơ điện tử', 'Kỹ thuật Cơ khí', 'Kỹ thuật Ô tô'],
    'Trường Kinh tế': [
        'Quản trị kinh doanh',
        'Kế toán',
        'Tài chỉ—Ngân hàng',
    ],
    'Trường Vật liệu': ['Kỹ thuật vật liệu', 'Vật liệu điện tử'],
    'Trường Hoá và Khoa học sự sống': [
        'Kỹ thuật hoá học',
        'Công nghệ sinh học',
        'Kỹ thuật môi trường',
    ],
    'Khoa Ngoại ngữ': ['Ngôn ngữ Anh'],
    'Khoa Toán-Tin': ['Toán tin', 'Hệ thống thông tin quản lý'],
    'Khoa KH&CNGD': [
        'Công nghệ giáo dục',
        'Quản lý giáo dục',
        'Tâm lý học tổ chức và doanh nghiệp',
    ],
    'Khoa Vật lý kỹ thuật': ['Vật lý kỹ thuật', 'Kỹ thuật hạt nhân'],
};

export const useAdminDashboardViewModel = (
    onNavigateToEdit?: (item: ClassInfo) => void,
    onLogout?: () => void,
) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [filters, setFilters] = useState<Partial<Record<keyof ClassInfo, string>>>({});
    const [classesData, setClassesData] = useState<ClassInfo[]>([]);

    const toggleProfile = () => {
        setIsProfileOpen(currentValue => !currentValue);
    };

    const handleLogout = () => {
        setIsProfileOpen(false);
        onLogout?.();
    };

    const handleUpload = () => {
        window.alert('Upload: Chức năng upload file (.xlsx) sẽ được thực hiện.');
    };

    const handleFilterChange = (key: keyof ClassInfo, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const filteredClassesData = filterTableByColumn(classesData, filters);

    const handleEdit = (item: ClassInfo) => {
        if (onNavigateToEdit) {
            onNavigateToEdit(item);
            return;
        }

        window.alert('Chuyển hướng: Sẽ chuyển sang màn hình sửa với thông tin tương ứng.');
    };

    const handleDelete = async (item: ClassInfo) => {
        if (window.confirm(`Xác nhận xoá: Bạn có chắc chắn muốn xoá lớp ${item.ma_lop}?`)) {
            try {
                const repo = new AdminClassRepositoryImpl();
                const controller = new AdminClassController(
                    new CreateClassCourseUseCase(repo),
                    undefined,
                    new DeleteClassCourseUseCase(repo)
                );
                
                // We need the class ID to delete it. Since ClassInfo doesn't have `id`, we might have a problem.
                // Wait, I should add `id` to ClassInfo or fetch it again.
                // Actually, I can just use `item.id` if I cast it. Let's cast it as any for now to get id.
                const classId = (item as any).id;
                if (!classId) {
                    window.alert("Lỗi: Không tìm thấy ID của lớp học");
                    return;
                }
                
                await controller.deleteClassCourse(classId);
                
                setClassesData(currentItems =>
                    currentItems.filter(classItem => classItem.ma_lop !== item.ma_lop),
                );
            } catch (error: any) {
                window.alert('Xoá lớp học thất bại: ' + (error.message || ''));
            }
        }
    };

    
    const [regPeriodType, setRegPeriodType] = useState<'register_program' | 'register_class'>('register_program');
    const [regPeriodStart, setRegPeriodStart] = useState<string>('');
    const [regPeriodEnd, setRegPeriodEnd] = useState<string>('');
    const [selectedSemester, setSelectedSemester] = useState<number | ''>('');
    const [isEditingPeriod, setIsEditingPeriod] = useState<boolean>(false);
    const [editPeriodId, setEditPeriodId] = useState<number | null>(null);

    const [selectedClassSemesterId, setSelectedClassSemesterId] = useState<number | ''>('');
    
    const [periodsData, setPeriodsData] = useState<AcademicPeriodDTO[]>([]);
    const [semestersData, setSemestersData] = useState<SemesterDTO[]>([]);

    const semesterRepo = new SemesterRepositoryImpl();
    const semesterUseCase = new GetAllSemestersUseCase(semesterRepo);
    const semesterController = new SemesterController(semesterUseCase);

    const periodRepo = new AcademicPeriodRepositoryImpl();
    const getAllPeriodsUseCase = new GetAllAcademicPeriodsUseCase(periodRepo);
    const savePeriodUseCase = new SaveAcademicPeriodUseCase(periodRepo);
    const deletePeriodUseCase = new DeleteAcademicPeriodUseCase(periodRepo);
    const periodController = new AcademicPeriodController(getAllPeriodsUseCase, savePeriodUseCase, deletePeriodUseCase);

    const loadData = async () => {
        try {
            const sData = await semesterController.getAllSemesters();
            setSemestersData(sData);
            if (sData.length > 0 && selectedSemester === '') {
                setSelectedSemester(sData[0].id);
            }
            if (sData.length > 0 && selectedClassSemesterId === '') {
                setSelectedClassSemesterId(sData[0].id);
            }

            const pData = await periodController.getAll();
            setPeriodsData(pData);
        } catch (error) {
            console.error("Failed to load registration periods data", error);
        }
    };

    const loadClassesData = async (semesterId: number) => {
        try {
            const repo = new AdminClassRepositoryImpl();
            const controller = new AdminClassController(
                new CreateClassCourseUseCase(repo),
                undefined,
                undefined,
                new GetAllClassesBySemesterUseCase(repo)
            );
            const data = await controller.getAllClassesBySemester(semesterId);
            
            const mappedData: ClassInfo[] = data.map((d: any) => ({
                id: d.id,
                ky: d.ky || semesterId.toString(),
                khoa_truong: d.khoa_truong || '',
                ma_lop: d.ma_lop || '',
                ma_lop_kem: d.ma_lop_kem !== 'NULL' ? d.ma_lop_kem : '',
                ma_hp: d.ma_hp || '',
                ten_hp: d.ten_hp || '',
                khoi_luong: d.khoi_luong || '',
                ghi_chu: d.ghi_chu !== 'NULL' ? d.ghi_chu : '',
                thu: d.thu || '',
                tiet_bd: d.tiet_bd || '',
                tiet_kt: d.tiet_kt || '',
                buoi: d.buoi || '',
                phong_hoc: d.phong_hoc || '',
                can_tn: d.can_tn !== 'NULL' ? d.can_tn : '',
                sl_dk: d.sl_dk?.toString() || '0',
                sl_max: d.sl_max?.toString() || '0',
                trang_thai: (d.sl_dk >= d.sl_max && d.sl_max > 0) ? 'Đã đầy' : 'Mở ĐK',
                teaching_type: d.teaching_type !== 'NULL' ? d.teaching_type : '',
            } as any));
            
            setClassesData(mappedData);
        } catch (error) {
            console.error("Failed to load classes data", error);
            setClassesData([]);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (selectedClassSemesterId !== '') {
            loadClassesData(selectedClassSemesterId as number);
        }
    }, [selectedClassSemesterId]);

    const handleSaveRegistrationPeriod = async () => {
        if (!selectedSemester || !regPeriodStart || !regPeriodEnd) {
            window.alert('Vui lòng chọn đầy đủ kỳ học và thời gian bắt đầu, kết thúc!');
            return;
        }

        if (new Date(regPeriodStart) >= new Date(regPeriodEnd)) {
            window.alert('Thời gian bắt đầu phải trước thời gian kết thúc!');
            return;
        }

        try {
            await periodController.save({
                id: editPeriodId || undefined,
                semester: selectedSemester as number,
                period_type: regPeriodType,
                start_date: regPeriodStart,
                end_date: regPeriodEnd
            });
            window.alert('Lưu cấu hình Giai đoạn đăng ký thành công!');
            setIsEditingPeriod(false);
            setEditPeriodId(null);
            setRegPeriodStart('');
            setRegPeriodEnd('');
            loadData();
        } catch (error: any) {
            window.alert(error.message || 'Có lỗi xảy ra.');
        }
    };

    const handleDeleteRegistrationPeriod = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thiết lập đợt đăng ký này?')) {
            try {
                await periodController.delete(id);
                loadData();
            } catch (error: any) {
                window.alert(error.message || 'Xoá thất bại.');
            }
        }
    };

    const handleEditRegistrationPeriod = (period?: AcademicPeriodDTO) => {
        if (period) {
            setEditPeriodId(period.id);
            setSelectedSemester(period.semester);
            setRegPeriodType(period.period_type as any);
            setRegPeriodStart(period.start_date.slice(0, 16)); // "YYYY-MM-DDTHH:mm" format expected by datetime-local
            setRegPeriodEnd(period.end_date.slice(0, 16));
        } else {
            setEditPeriodId(null);
            setSelectedSemester('');
            setRegPeriodType('register_program');
            setRegPeriodStart('');
            setRegPeriodEnd('');
        }
        setIsEditingPeriod(true);
    };


    return {
        isProfileOpen,
        toggleProfile,
        handleLogout,
        handleUpload,
        filters,
        handleFilterChange,
        classesData,
        filteredClassesData,
        handleEdit,
        handleDelete,
        // Xuất thêm các thuộc tính mới
        regPeriodType,
        setRegPeriodType,
        regPeriodStart,
        setRegPeriodStart,
        regPeriodEnd,
        setRegPeriodEnd,
        selectedSemester,
        setSelectedSemester,
        semestersData,
        periodsData,
        handleSaveRegistrationPeriod,
        isEditingPeriod,
        setIsEditingPeriod,
        editPeriodId,
        setEditPeriodId,
        handleEditRegistrationPeriod,
        handleDeleteRegistrationPeriod,
        selectedClassSemesterId,
        setSelectedClassSemesterId,
    };
};
