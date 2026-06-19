import { describe, it, expect } from 'vitest';
import { NormalStudyStrategy } from '../../../../src/domain/strategies/NormalStudyStrategy';

describe('NormalStudyStrategy', () => {
    it('should return 24 as max allowed credits', () => {
        const strategy = new NormalStudyStrategy();
        expect(strategy.getMaxAllowedCredits()).toBe(24);
    });

    it('should return the correct status note', () => {
        const strategy = new NormalStudyStrategy();
        expect(strategy.getRegistrationStatusNote()).toBe('Bạn được đăng ký tối đa 24 TC');
    });
});
