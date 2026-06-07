import React, { useState, useEffect } from 'react';

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


export interface ClassInfo {
    ky: string;
    khoa_truong: string;
    ma_lop: string;
    ma_lop_kem: string;
    ma_hp: string;
    ten_hp: string;
    khoi_luong: string;
    ghi_chu: string;
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
    const [searchQuery, setSearchQuery] = useState('');
    const [searchMode, setSearchMode] = useState('Mã lớp');
    const [isModeModalOpen, setModeModalOpen] = useState(false);
    const [department, setDepartment] = useState('');
    const [isDeptModalOpen, setDeptModalOpen] = useState(false);
    const [major, setMajor] = useState('');
    const [isMajorModalOpen, setMajorModalOpen] = useState(false);
    const [classesData, setClassesData] = useState<ClassInfo[]>([
        {
            ky: '20261',
            khoa_truong: 'Khoa KH&CNGD',
            ma_lop: '360018',
            ma_lop_kem: '888888',
            ma_hp: 'AC2020',
            ten_hp: 'Đồ hoạ hình động 2D,3D',
            khoi_luong: '3(3-1-0-6)',
            ghi_chu: 'Công nghệ giáo dục 02 K68',
            tiet_bd: '1',
            tiet_kt: '3',
            buoi: 'Sáng',
            phong_hoc: 'C7-111',
            can_tn: 'NULL',
            sl_dk: '51',
            sl_max: '60',
            trang_thai: 'Mở ĐK',
            teaching_type: '',
        },
    ]);

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

    const handleSearch = () => {
        window.alert(`Tìm kiếm: Đang tìm kiếm: ${searchQuery} theo ${searchMode}`);
    };

    const handleEdit = (item: ClassInfo) => {
        if (onNavigateToEdit) {
            onNavigateToEdit(item);
            return;
        }

        window.alert('Chuyển hướng: Sẽ chuyển sang màn hình sửa với thông tin tương ứng.');
    };

    const handleDelete = (item: ClassInfo) => {
        if (window.confirm(`Xác nhận xoá: Bạn có chắc chắn muốn xoá lớp ${item.ma_lop}?`)) {
            setClassesData(currentItems =>
                currentItems.filter(classItem => classItem.ma_lop !== item.ma_lop),
            );
        }
    };

    const handleSelectDepartment = (selectedDepartment: string) => {
        setDepartment(selectedDepartment);
        setMajor('');
        setDeptModalOpen(false);
    };

    const searchModeOptions = ['Mã lớp', 'Mã HP', 'Tên HP'];
    const departmentOptions = Object.keys(majorMapping);
    const majorOptions = department ? majorMapping[department] ?? [] : [];

    
    const [regPeriodType, setRegPeriodType] = useState<'register_program' | 'register_class'>('register_program');
    const [regPeriodStart, setRegPeriodStart] = useState<string>('');
    const [regPeriodEnd, setRegPeriodEnd] = useState<string>('');
    const [selectedSemester, setSelectedSemester] = useState<number | ''>('');
    const [isEditingPeriod, setIsEditingPeriod] = useState<boolean>(false);
    
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

            const pData = await periodController.getAll();
            setPeriodsData(pData);
        } catch (error) {
            console.error("Failed to load registration periods data", error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

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
                semester: selectedSemester as number,
                period_type: regPeriodType,
                start_date: regPeriodStart,
                end_date: regPeriodEnd
            });
            window.alert('Lưu cấu hình Giai đoạn đăng ký thành công!');
            setIsEditingPeriod(false);
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

    const handleEditRegistrationPeriod = () => {
        setIsEditingPeriod(true);
    };


    return {
        isProfileOpen,
        toggleProfile,
        handleLogout,
        handleUpload,
        searchQuery,
        setSearchQuery,
        searchMode,
        setSearchMode,
        department,
        setDepartment,
        major,
        setMajor,
        handleSearch,
        classesData,
        handleEdit,
        handleDelete,
        isModeModalOpen,
        setModeModalOpen,
        isDeptModalOpen,
        setDeptModalOpen,
        isMajorModalOpen,
        setMajorModalOpen,
        searchModeOptions,
        departmentOptions,
        majorOptions,
        handleSelectDepartment,
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
        handleEditRegistrationPeriod,
        handleDeleteRegistrationPeriod,
    };
};
