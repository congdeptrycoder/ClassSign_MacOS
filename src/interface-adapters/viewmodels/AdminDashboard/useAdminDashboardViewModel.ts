import { useState } from 'react';

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
    };
};
