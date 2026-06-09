Bảng accounts: Chứa thông tin tài khoản có thể truy cập hệ thống
- id: INTEGER (PRIMARY KEY AUTOINCREMENT)
- username: TEXT (UNIQUE)
- password: TEXT
- name: TEXT
- role: TEXT (admin, student, lecturer)
- is_active: INTEGER (mặc định 1 - true)
- id_card: TEXT (UNIQUE)
- created_at: TEXT (DATETIME)
- updated_at: TEXT (DATETIME)

Bảng students: Chứa thông tin sinh viên
- id: INTEGER (Khoá ngoại với id của bảng accounts)
- email: TEXT
- phone: TEXT
- address: TEXT
- dob: TEXT (Ngày sinh - YYYY-MM-DD)
- gender: TEXT (Giới tính)
- status: TEXT (study - Đang học, graduate - Đã tốt nghiệp, leave - Bảo lưu, drop - Buộc thôi học, study_cc1 - Cảnh cáo mức 1, study_cc2 - Cảnh cáo mức 2, study_cc3 - Cảnh cáo mức 3)
- created_at: TEXT (DATETIME)
- updated_at: TEXT (DATETIME)

Bảng majors: Chứa thông tin khoa
- id: INTEGER (PRIMARY KEY AUTOINCREMENT)
- major_code: TEXT
- major_name: TEXT
- created_at: TEXT (DATETIME)
- updated_at: TEXT (DATETIME)

Bảng programs: Chứa thông tin chương trình đào tạo
- id: INTEGER (PRIMARY KEY AUTOINCREMENT)
- program_code: TEXT
- program_name: TEXT
- major_id: INTEGER (FOREIGN KEY to majors)
- created_at: TEXT (DATETIME)
- updated_at: TEXT (DATETIME)

Bảng semesters: Chứa thông tin học kỳ
- id: INTEGER (PRIMARY KEY AUTOINCREMENT)
- semester: INTEGER (năm học + kỳ học)
- is_active: INTEGER
- created_at: TEXT (DATETIME)
- updated_at: TEXT (DATETIME)

Bảng academic_periods: Chứa thông tin giai đoạn đăng ký
- id: INTEGER (PRIMARY KEY AUTOINCREMENT)
- semester: INTEGER (FOREIGN KEY to semesters)
- period_type: TEXT (register_program, register_class)
- start_date: TEXT (DATETIME)
- end_date: TEXT (DATETIME)
- is_active: INTEGER
- created_at: TEXT (DATETIME)
- updated_at: TEXT (DATETIME)

Bảng courses: Chứa thông tin học phần
- id: INTEGER (PRIMARY KEY AUTOINCREMENT)
- course_code: TEXT
- course_name: TEXT
- credits: INTEGER
- created_at: TEXT (DATETIME)
- updated_at: TEXT (DATETIME)

Bảng program_course: Chứa thông tin danh sách học phần của chương trình đào tạo
- id: INTEGER (PRIMARY KEY AUTOINCREMENT)
- program_id: INTEGER (FOREIGN KEY to programs)
- course_id: INTEGER (FOREIGN KEY to courses)
- prerequisite_course_id: INTEGER (FOREIGN KEY to courses, học phần tiên quyết)
- parallel_course_id: INTEGER (FOREIGN KEY to courses, học phần song song)
- created_at: TEXT (DATETIME)
- updated_at: TEXT (DATETIME)

Bảng classes: Chứa thông tin lớp học của student
- id: INTEGER (PRIMARY KEY AUTOINCREMENT)
- class_name: TEXT
- program_id: INTEGER (FOREIGN KEY to programs)
- created_at: TEXT (DATETIME)
- updated_at: TEXT (DATETIME)

Bảng classes_student: Chứa danh sách lớp học 
- id_class: INTEGER (FOREIGN KEY to classes)
- id_account: INTEGER (FOREIGN KEY to accounts)

Bảng classes_course: Chứa thông tin lớp học phần
- id: INTEGER (PRIMARY KEY AUTOINCREMENT)
- course_id: INTEGER (FOREIGN KEY to courses)
- semester: INTEGER (FOREIGN KEY to semesters)
- detail: TEXT (JSON chứa thời khóa biểu và địa điểm)
- total_slots: INTEGER (tổng số chỗ)
- occupied_slots: INTEGER (số chỗ đã đăng ký)
- id_lecturer: INTEGER (FOREIGN KEY to accounts)
- created_at: TEXT (DATETIME)
- updated_at: TEXT (DATETIME)

Bảng student_courses: Bảng đăng ký học phần
- id: INTEGER (PRIMARY KEY AUTOINCREMENT)
- student_id: INTEGER (FOREIGN KEY to students)
- course_id: INTEGER (FOREIGN KEY to courses)
- semester: INTEGER (FOREIGN KEY to semesters)
- status: TEXT (registered: Đã đăng ký, chưa học xong; completed: Đã học xong - Cập nhật khi đăng ký lớp kết thúc; re_registered: Đã học xong nhưng đăng ký lại)
- created_at: TEXT (DATETIME)

Bảng student_class_registrations: Bảng đăng ký lớp học phần
- id: INTEGER (PRIMARY KEY AUTOINCREMENT)
- student_id: INTEGER (FOREIGN KEY to students)
- class_id: INTEGER (FOREIGN KEY to classes_course)
- created_at: TEXT (DATETIME)