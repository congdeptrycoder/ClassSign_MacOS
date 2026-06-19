import { IValidationStrategy } from '../IValidationStrategy';
import { ClassRegistrationContext } from './ClassRegistrationContext';
import { getActiveRegistrationPeriod } from '../../utils/registration.utils';

export class ActivePeriodClassStrategy implements IValidationStrategy<ClassRegistrationContext> {
    async validate(context: ClassRegistrationContext): Promise<void> {
        const activePeriod = await getActiveRegistrationPeriod('register_class');
        if (!activePeriod) {
            throw new Error('Hiện không trong giai đoạn đăng ký lớp học.');
        }
    }
}
