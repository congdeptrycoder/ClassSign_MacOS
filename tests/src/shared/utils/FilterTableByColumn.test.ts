import { describe, it, expect } from 'vitest';
import { filterTableByColumn } from '../../../../src/shared/utils/FilterTableByColumn';

describe('filterTableByColumn', () => {
  const sampleData = [
    { id: 1, name: 'Alice', category: 'A', extra: null },
    { id: 2, name: 'Bob', category: 'B', extra: 'exists' },
    { id: 3, name: 'Charlie', category: 'A', extra: undefined },
  ];

  it('should return all items if filters is empty', () => {
    const result = filterTableByColumn(sampleData, {});
    expect(result).toEqual(sampleData);
  });

  it('should skip filters with empty/falsy values', () => {
    const result = filterTableByColumn(sampleData, { name: '', category: undefined });
    expect(result).toEqual(sampleData);
  });

  it('should filter items by matching substrings case-insensitively', () => {
    const result = filterTableByColumn(sampleData, { name: 'li' });
    expect(result).toEqual([
      { id: 1, name: 'Alice', category: 'A', extra: null },
      { id: 3, name: 'Charlie', category: 'A', extra: undefined },
    ]);
  });

  it('should match multiple filter fields', () => {
    const result = filterTableByColumn(sampleData, { name: 'ch', category: 'a' });
    expect(result).toEqual([
      { id: 3, name: 'Charlie', category: 'A', extra: undefined },
    ]);
  });

  it('should return false if target item value is null or undefined when filter is present', () => {
    // When extra has a filter "ex", Bob should match, but Alice (null) and Charlie (undefined) should not
    const result = filterTableByColumn(sampleData, { extra: 'ex' });
    expect(result).toEqual([
      { id: 2, name: 'Bob', category: 'B', extra: 'exists' },
    ]);
  });
});
