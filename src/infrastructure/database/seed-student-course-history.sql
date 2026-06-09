-- Demo learning history for student36.
-- Courses with status = 'completed' are rendered green in the curriculum screen.

UPDATE student_courses
SET status = 'completed'
WHERE student_id = 2
  AND course_id IN (
    SELECT id
    FROM courses
    WHERE course_code IN ('AC2010', 'AC2020', 'ED1010')
  );

INSERT INTO student_courses (student_id, course_id, semester, status)
SELECT 2, c.id, 3, 'completed'
FROM courses c
WHERE c.course_code IN ('SSH1110', 'SSH1120')
  AND NOT EXISTS (
    SELECT 1
    FROM student_courses sc
    WHERE sc.student_id = 2
      AND sc.course_id = c.id
      AND sc.status = 'completed'
  );
