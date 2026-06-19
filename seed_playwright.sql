INSERT INTO accounts (id, username, password, name, role, is_active) VALUES (3, 'lecturer36', 'Lecturer36@', 'Lecturer 36', 'lecturer', 1) ON CONFLICT(id) DO NOTHING;

UPDATE academic_periods 
SET is_active = 1, start_date = datetime('now', '-1 day'), end_date = datetime('now', '+7 days') 
WHERE period_type = 'register_program' AND semester = 3;

INSERT INTO academic_periods (semester, period_type, start_date, end_date, is_active) 
VALUES (3, 'register_class', datetime('now', '-1 day'), datetime('now', '+7 days'), 1);

INSERT INTO classes_course (course_id, semester, detail, total_slots, occupied_slots, id_lecturer)
VALUES 
(32, 1, '{"slots":[{"day":"T2","periods":[1,2,3]}]}', 50, 0, 3),
(32, 2, '{"slots":[{"day":"T2","periods":[1,2,3]}]}', 50, 0, 3),
(32, 3, '{"slots":[{"day":"T2","periods":[1,2,3]}]}', 50, 0, 3);
