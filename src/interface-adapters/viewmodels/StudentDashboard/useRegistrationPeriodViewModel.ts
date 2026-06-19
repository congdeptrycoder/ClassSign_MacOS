import { useState, useEffect } from 'react';
import { academicPeriodController } from '../../../di/admin.di';

export const useRegistrationPeriodViewModel = () => {
    const [currentRegPeriodType, setCurrentRegPeriodType] = useState<'register_program' | 'register_class' | 'none'>('none');
    const [activeSemesterId, setActiveSemesterId] = useState<number | null>(null);
    const [activeSemesterName, setActiveSemesterName] = useState<number | null>(null);

    useEffect(() => {
        const checkRegistrationPeriod = async () => {
            try {
                const periods = await academicPeriodController.getAll();
                const activePeriod = periods.find(p => p.is_active === 1);

                if (activePeriod) {
                    const now = new Date();
                    const start = new Date(activePeriod.start_date);
                    const end = new Date(activePeriod.end_date);

                    setActiveSemesterId(activePeriod.semester);
                    setActiveSemesterName(activePeriod.semester_name);

                    if (now >= start && now <= end) {
                        setCurrentRegPeriodType(
                            activePeriod.period_type as 'register_program' | 'register_class'
                        );
                    } else {
                        setCurrentRegPeriodType('none');
                    }
                } else {
                    setCurrentRegPeriodType('none');
                    setActiveSemesterId(null);
                    setActiveSemesterName(null);
                }
            } catch (error) {
                console.error('Lỗi khi kiểm tra đợt đăng ký từ server', error);
                setCurrentRegPeriodType('none');
            }
        };

        checkRegistrationPeriod();
        const interval = setInterval(checkRegistrationPeriod, 60000);
        return () => clearInterval(interval);
    }, []);

    return { currentRegPeriodType, activeSemesterId, activeSemesterName };
};
