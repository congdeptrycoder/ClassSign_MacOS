import { describe, it, expect } from 'vitest';
import { Warning1StudyStrategy } from '../../../../src/domain/strategies/Warning1StudyStrategy';
import { Warning2StudyStrategy } from '../../../../src/domain/strategies/Warning2StudyStrategy';
import { Warning3StudyStrategy } from '../../../../src/domain/strategies/Warning3StudyStrategy';

describe('WarningStudyStrategies', () => {
    describe('Warning1StudyStrategy', () => {
        it('should return 20 as max allowed credits', () => {
            const strategy = new Warning1StudyStrategy();
            expect(strategy.getMaxAllowedCredits()).toBe(20);
        });

        it('should return the correct status note', () => {
            const strategy = new Warning1StudyStrategy();
            expect(strategy.getRegistrationStatusNote()).toBe('Bạn đang bị cảnh cáo mức 1. Chỉ được đăng ký tối đa 20 TC');
        });
    });

    describe('Warning2StudyStrategy', () => {
        it('should return 16 as max allowed credits', () => {
            const strategy = new Warning2StudyStrategy();
            expect(strategy.getMaxAllowedCredits()).toBe(16);
        });

        it('should return the correct status note', () => {
            const strategy = new Warning2StudyStrategy();
            expect(strategy.getRegistrationStatusNote()).toBe('Bạn đang bị cảnh cáo mức 2. Chỉ được đăng ký tối đa 16 TC');
        });
    });

    describe('Warning3StudyStrategy', () => {
        it('should return 12 as max allowed credits', () => {
            const strategy = new Warning3StudyStrategy();
            expect(strategy.getMaxAllowedCredits()).toBe(12);
        });

        it('should return the correct status note', () => {
            const strategy = new Warning3StudyStrategy();
            expect(strategy.getRegistrationStatusNote()).toBe('Bạn đang bị cảnh cáo mức 3. Chỉ được đăng ký tối đa 12 TC');
        });
    });
});
