import { describe, it, expect, vi } from 'vitest';
import { ValidationContext, IValidationStrategy } from '../../../server/strategies/IValidationStrategy';

describe('ValidationContext', () => {
    it('should call all validation strategies in order', async () => {
        const context = new ValidationContext<string>();
        
        const strategy1: IValidationStrategy<string> = {
            validate: vi.fn().mockResolvedValue(undefined)
        };
        const strategy2: IValidationStrategy<string> = {
            validate: vi.fn().mockResolvedValue(undefined)
        };

        context.addStrategy(strategy1);
        context.addStrategy(strategy2);

        await context.validateAll('test-data');

        expect(strategy1.validate).toHaveBeenCalledWith('test-data');
        expect(strategy2.validate).toHaveBeenCalledWith('test-data');
    });

    it('should bubble up error and stop validation if a strategy throws', async () => {
        const context = new ValidationContext<string>();
        
        const strategy1: IValidationStrategy<string> = {
            validate: vi.fn().mockRejectedValue(new Error('Strategy 1 failed'))
        };
        const strategy2: IValidationStrategy<string> = {
            validate: vi.fn().mockResolvedValue(undefined)
        };

        context.addStrategy(strategy1);
        context.addStrategy(strategy2);

        await expect(context.validateAll('test-data')).rejects.toThrow('Strategy 1 failed');
        
        expect(strategy1.validate).toHaveBeenCalledWith('test-data');
        expect(strategy2.validate).not.toHaveBeenCalled();
    });
});
