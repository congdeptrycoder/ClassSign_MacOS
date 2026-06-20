import { useState, useEffect } from 'react';
import { filterTableByColumn } from '../../../shared/utils/FilterTableByColumn';
import { adminClassController } from '../../../di/admin.di';
import { ClassCourseOutputDTO } from '../../entities/ClassCourse';

export interface ClassInfo {
    id: number;
    semester: string;
    departmentName: string;
    classCode: string;
    subClassCode: string;
    courseCode: string;
    courseName: string;
    credits: string;
    notes: string;
    dayOfWeek: string;
    startPeriod: string;
    endPeriod: string;
    daySession: string;
    room: string;
    requiresExperiment: string;
    occupiedSlots: string;
    maxSlots: string;
    status: string;
    teachingType: string;
}

export const useAdminClassViewModel = (
    onNavigateToEdit?: (item: ClassInfo) => void,
) => {
    const [filters, setFilters] = useState<Partial<Record<keyof ClassInfo, string>>>({});
    const [classesData, setClassesData] = useState<ClassInfo[]>([]);
    const [selectedClassSemesterId, setSelectedClassSemesterId] = useState<number | ''>('');

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
        if (window.confirm(`Xác nhận xoá: Bạn có chắc chắn muốn xoá lớp ${item.classCode}?`)) {
            try {
                const classId = item.id;
                if (!classId) {
                    window.alert("Lỗi: Không tìm thấy ID của lớp học");
                    return;
                }

                await adminClassController.deleteClassCourse(classId);

                setClassesData(currentItems =>
                    currentItems.filter(classItem => classItem.classCode !== item.classCode),
                );
            } catch (error: any) {
                window.alert('Xoá lớp học thất bại: ' + (error.message || ''));
            }
        }
    };

    const loadClassesData = async (semesterId: number) => {
        try {
            const data: ClassCourseOutputDTO[] = await adminClassController.getAllClassesBySemester(semesterId);

            const mappedData: ClassInfo[] = data.map((d: ClassCourseOutputDTO) => ({
                id: d.id,
                semester: d.semester?.toString() || semesterId.toString(),
                departmentName: d.departmentName || '',
                classCode: d.classCode || '',
                subClassCode: d.subClassCode !== 'NULL' && d.subClassCode ? d.subClassCode : '',
                courseCode: d.courseCode || '',
                courseName: d.courseName || '',
                credits: d.credits || '',
                notes: d.notes !== 'NULL' && d.notes ? d.notes : '',
                dayOfWeek: d.dayOfWeek || '',
                startPeriod: d.startPeriod || '',
                endPeriod: d.endPeriod || '',
                daySession: d.daySession || '',
                room: d.room || '',
                requiresExperiment: d.requiresExperiment !== 'NULL' && d.requiresExperiment ? d.requiresExperiment : '',
                occupiedSlots: d.occupiedSlots?.toString() || '0',
                maxSlots: d.maxSlots?.toString() || '0',
                status: (d.occupiedSlots !== undefined && d.maxSlots !== undefined && d.occupiedSlots >= d.maxSlots && d.maxSlots > 0) ? 'Đã đầy' : 'Mở ĐK',
                teachingType: d.teachingType !== 'NULL' && d.teachingType ? d.teachingType : '',
            }));

            setClassesData(mappedData);
        } catch (error) {
            console.error("Failed to load classes data", error);
            setClassesData([]);
        }
    };

    useEffect(() => {
        if (selectedClassSemesterId !== '') {
            loadClassesData(selectedClassSemesterId as number);
        }
    }, [selectedClassSemesterId]);

    return {
        filters,
        handleFilterChange,
        classesData,
        filteredClassesData,
        handleEdit,
        handleDelete,
        selectedClassSemesterId,
        setSelectedClassSemesterId,
    };
};
