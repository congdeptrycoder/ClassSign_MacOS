import { describe, it, expect } from 'vitest';
import { AcademicPeriod } from '../../../../src/domain/entities/AcademicPeriod';
import { CourseRegistrationStat } from '../../../../src/domain/entities/CourseRegistrationStat';

describe('Domain Entities Constructors', () => {
  it('should construct AcademicPeriod correctly', () => {
    const period = new AcademicPeriod(
      1,
      20231,
      1,
      'hoc_phan',
      '2023-09-01',
      '2023-10-01',
      1
    );

    expect(period.id).toBe(1);
    expect(period.semester).toBe(20231);
    expect(period.semester_name).toBe(1);
    expect(period.period_type).toBe('hoc_phan');
    expect(period.start_date).toBe('2023-09-01');
    expect(period.end_date).toBe('2023-10-01');
    expect(period.is_active).toBe(1);
  });

  it('should construct CourseRegistrationStat correctly', () => {
    const stat = new CourseRegistrationStat(
      10,
      'CS101',
      'Intro to CS',
      'Computer Science',
      45,
      2,
      80
    );

    expect(stat.course_id).toBe(10);
    expect(stat.ma_hp).toBe('CS101');
    expect(stat.ten_hp).toBe('Intro to CS');
    expect(stat.truong_khoa).toBe('Computer Science');
    expect(stat.so_luong_dang_ky).toBe(45);
    expect(stat.so_luong_lop).toBe(2);
    expect(stat.so_luong_dk_toi_da).toBe(80);
  });
});
