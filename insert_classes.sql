INSERT INTO classes_course (detail, course_id, semester, total_slots, occupied_slots, id_lecturer)
SELECT '{"ma_lop":"148010","thu":"2","tiet_bd":"1","tiet_kt":"3","phong_hoc":"D9-401"}', id, 3, 60, 0, NULL FROM courses WHERE course_code = 'AC2010';

INSERT INTO classes_course (detail, course_id, semester, total_slots, occupied_slots, id_lecturer)
SELECT '{"ma_lop":"148011","thu":"2","tiet_bd":"4","tiet_kt":"6","phong_hoc":"D9-401"}', id, 3, 60, 0, NULL FROM courses WHERE course_code = 'AC2010';

INSERT INTO classes_course (detail, course_id, semester, total_slots, occupied_slots, id_lecturer)
SELECT '{"ma_lop":"148020","thu":"3","tiet_bd":"1","tiet_kt":"3","phong_hoc":"D9-405"}', id, 3, 60, 0, NULL FROM courses WHERE course_code = 'AC2020';

INSERT INTO classes_course (detail, course_id, semester, total_slots, occupied_slots, id_lecturer)
SELECT '{"ma_lop":"148021","thu":"3","tiet_bd":"4","tiet_kt":"6","phong_hoc":"D9-405"}', id, 3, 60, 0, NULL FROM courses WHERE course_code = 'AC2020';

INSERT INTO classes_course (detail, course_id, semester, total_slots, occupied_slots, id_lecturer)
SELECT '{"ma_lop":"148030","thu":"4","tiet_bd":"1","tiet_kt":"3","phong_hoc":"D9-501"}', id, 3, 60, 0, NULL FROM courses WHERE course_code = 'AC2030';

INSERT INTO classes_course (detail, course_id, semester, total_slots, occupied_slots, id_lecturer)
SELECT '{"ma_lop":"148031","thu":"4","tiet_bd":"4","tiet_kt":"6","phong_hoc":"D9-501"}', id, 3, 60, 0, NULL FROM courses WHERE course_code = 'AC2030';

INSERT INTO classes_course (detail, course_id, semester, total_slots, occupied_slots, id_lecturer)
SELECT '{"ma_lop":"148040","thu":"5","tiet_bd":"1","tiet_kt":"3","phong_hoc":"TC-301"}', id, 3, 60, 0, NULL FROM courses WHERE course_code = 'AC2040';

INSERT INTO classes_course (detail, course_id, semester, total_slots, occupied_slots, id_lecturer)
SELECT '{"ma_lop":"148041","thu":"5","tiet_bd":"4","tiet_kt":"6","phong_hoc":"TC-301"}', id, 3, 60, 0, NULL FROM courses WHERE course_code = 'AC2040';

INSERT INTO classes_course (detail, course_id, semester, total_slots, occupied_slots, id_lecturer)
SELECT '{"ma_lop":"148050","thu":"6","tiet_bd":"1","tiet_kt":"3","phong_hoc":"D9-402"}', id, 3, 60, 0, NULL FROM courses WHERE course_code = 'AC2050';

INSERT INTO classes_course (detail, course_id, semester, total_slots, occupied_slots, id_lecturer)
SELECT '{"ma_lop":"148051","thu":"6","tiet_bd":"4","tiet_kt":"6","phong_hoc":"D9-402"}', id, 3, 60, 0, NULL FROM courses WHERE course_code = 'AC2050';
