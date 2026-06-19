import { describe, it, expect } from 'vitest';
import { StudentStatusStrategyFactory } from '../../../../src/domain/strategies/StudentStatusStrategyFactory';
import { NormalStudyStrategy } from '../../../../src/domain/strategies/NormalStudyStrategy';
import { Warning1StudyStrategy } from '../../../../src/domain/strategies/Warning1StudyStrategy';
import { Warning2StudyStrategy } from '../../../../src/domain/strategies/Warning2StudyStrategy';
import { Warning3StudyStrategy } from '../../../../src/domain/strategies/Warning3StudyStrategy';

describe('StudentStatusStrategyFactory', () => {
    it('should return NormalStudyStrategy for status "study"', () => {
        const strategy = StudentStatusStrategyFactory.getStrategy('study');
        expect(strategy).toBeInstanceOf(NormalStudyStrategy);
    });

    it('should return Warning1StudyStrategy for status "study_cc1"', () => {
        const strategy = StudentStatusStrategyFactory.getStrategy('study_cc1');
        expect(strategy).toBeInstanceOf(Warning1StudyStrategy);
    });

    it('should return Warning2StudyStrategy for status "study_cc2"', () => {
        const strategy = StudentStatusStrategyFactory.getStrategy('study_cc2');
        expect(strategy).toBeInstanceOf(Warning2StudyStrategy);
    });

    it('should return Warning3StudyStrategy for status "study_cc3"', () => {
        const strategy = StudentStatusStrategyFactory.getStrategy('study_cc3');
        expect(strategy).toBeInstanceOf(Warning3StudyStrategy);
    });

    it('should return NormalStudyStrategy for unknown status', () => {
        const strategy = StudentStatusStrategyFactory.getStrategy('unknown_status');
        expect(strategy).toBeInstanceOf(NormalStudyStrategy);
    });

    it('should register and return new strategy', () => {
        class CustomStrategy extends NormalStudyStrategy {}
        const newStrategy = new CustomStrategy();
        StudentStatusStrategyFactory.registerStrategy('custom', newStrategy);
        const retrieved = StudentStatusStrategyFactory.getStrategy('custom');
        expect(retrieved).toBe(newStrategy);
    });
});
