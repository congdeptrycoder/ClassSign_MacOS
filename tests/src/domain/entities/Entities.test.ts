import { describe, it, expect } from 'vitest';
import { AcademicPeriod } from '../../../../src/domain/entities/AcademicPeriod';
import { CourseRegistrationStat } from '../../../../src/domain/entities/CourseRegistrationStat';
import { Semester } from '../../../../src/domain/entities/Semester';

describe('Domain Entities Constructors and Behaviors', () => {
  it('should construct AcademicPeriod correctly and compute active/remaining status', () => {
    const period = new AcademicPeriod(
      1,
      20231,
      1,
      'hoc_phan',
      '2020-09-01',
      '2030-10-01',
      1
    );

    expect(period.id).toBe(1);
    expect(period.semester).toBe(20231);
    expect(period.semester_name).toBe(1);
    expect(period.period_type).toBe('hoc_phan');
    expect(period.start_date).toBe('2020-09-01');
    expect(period.end_date).toBe('2030-10-01');
    expect(period.is_active).toBe(1);

    expect(period.isCurrentlyActive()).toBe(true);
    expect(period.getDaysRemaining()).toBeGreaterThan(0);

    const inactivePeriod = new AcademicPeriod(
      2,
      20231,
      1,
      'hoc_phan',
      '2020-09-01',
      '2030-10-01',
      0
    );
    expect(inactivePeriod.isCurrentlyActive()).toBe(false);

    const pastPeriod = new AcademicPeriod(
      3,
      20231,
      1,
      'hoc_phan',
      '2020-09-01',
      '2021-10-01',
      1
    );
    expect(pastPeriod.isCurrentlyActive()).toBe(false);
    expect(pastPeriod.getDaysRemaining()).toBe(0);
  });

  it('should construct CourseRegistrationStat correctly and compute rates', () => {
    const stat = new CourseRegistrationStat(
      10,
      'CS101',
      'Intro to CS',
      'Computer Science',
      45,
      2,
      80
    );

    expect(stat.courseId).toBe(10);
    expect(stat.courseCode).toBe('CS101');
    expect(stat.courseName).toBe('Intro to CS');
    expect(stat.departmentName).toBe('Computer Science');
    expect(stat.registrationCount).toBe(45);
    expect(stat.classCount).toBe(2);
    expect(stat.maxRegistrationCount).toBe(80);

    expect(stat.getFillRate()).toBe(56); // 45 / 80 = 56.25% -> 56%
    expect(stat.isFull()).toBe(false);

    const fullStat = new CourseRegistrationStat(
      11,
      'CS102',
      'Advanced CS',
      'Computer Science',
      80,
      2,
      80
    );
    expect(fullStat.isFull()).toBe(true);
    expect(fullStat.getFillRate()).toBe(100);
  });

  it('should construct Semester correctly and parse academic year and semester number', () => {
    const semester = new Semester(1, 20231, 1);
    expect(semester.id).toBe(1);
    expect(semester.semester).toBe(20231);
    expect(semester.is_active).toBe(1);

    expect(semester.getAcademicYear()).toBe('2023-2024');
    expect(semester.getSemesterNumber()).toBe(1);

    const semester2 = new Semester(2, 20242, 0);
    expect(semester2.getAcademicYear()).toBe('2024-2025');
    expect(semester2.getSemesterNumber()).toBe(2);
  });
});
