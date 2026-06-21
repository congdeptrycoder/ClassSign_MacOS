"use strict";
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3");
const events = require("events");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const path__namespace = /* @__PURE__ */ _interopNamespaceDefault(path);
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs);
const icon = path.join(__dirname, "./chunks/hust-logo-BIrxHkKN.png");
const isTest = process.env.NODE_ENV === "test";
let dbPath = ":memory:";
if (!isTest) {
  if (process.versions && process.versions.electron) {
    const { app: app2 } = require("electron");
    const fs2 = require("fs");
    if (app2.isPackaged) {
      const userDataPath = app2.getPath("userData");
      dbPath = path.join(userDataPath, "database.sqlite");
      if (!fs2.existsSync(dbPath)) {
        const originalPath = path.join(process.resourcesPath, "database.sqlite");
        if (fs2.existsSync(originalPath)) {
          fs2.copyFileSync(originalPath, dbPath);
        }
      }
    } else {
      dbPath = path.join(__dirname, "../../src/infrastructure/database/database.sqlite");
    }
  } else {
    dbPath = path.join(__dirname, "../src/infrastructure/database/database.sqlite");
  }
}
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Lỗi kết nối cơ sở dữ liệu:", err.message);
  }
});
function sendSuccess(res, data, message, statusCode = 200) {
  const body = {
    success: true,
    data,
    ...message ? { message } : {}
  };
  return res.status(statusCode).json(body);
}
function sendError(res, statusCode, message) {
  const body = {
    success: false,
    message
  };
  return res.status(statusCode).json(body);
}
const login = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return sendError(res, 400, "Vui lòng cung cấp tài khoản và mật khẩu.");
  }
  const query = `
    SELECT a.id, a.username, a.name, a.role, a.id_card, a.is_active, s.status
    FROM accounts a
    LEFT JOIN students s ON a.id = s.id
    WHERE a.username = ? AND a.password = ?
  `;
  db.get(query, [username, password], (err, row) => {
    if (err) {
      console.error("Database error:", err);
      return sendError(res, 500, "Lỗi máy chủ nội bộ.");
    }
    if (!row) {
      return sendError(res, 401, "Sai tài khoản hoặc mật khẩu.");
    }
    if (row.is_active === 0) {
      return sendError(res, 403, "Tài khoản đã bị khoá.");
    }
    return sendSuccess(res, {
      user: {
        id: row.id,
        username: row.username,
        name: row.name,
        role: row.role,
        id_card: row.id_card,
        status: row.status
      }
    });
  });
};
const router$4 = express.Router();
router$4.post("/login", login);
const getAllSemesters = (_req, res) => {
  const query = "SELECT * FROM semesters ORDER BY semester DESC";
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return sendError(res, 500, "Lỗi máy chủ nội bộ.");
    }
    return sendSuccess(res, rows);
  });
};
const createSemester = (req, res) => {
  const { semester } = req.body;
  if (!semester || typeof semester !== "string") {
    return sendError(res, 400, "Mã kỳ không hợp lệ.");
  }
  const query = "INSERT INTO semesters (semester, is_active) VALUES (?, 0)";
  db.run(query, [semester.trim()], function(err) {
    if (err) {
      console.error("Database error:", err);
      if (err.message.includes("UNIQUE constraint failed")) {
        return sendError(res, 400, "Học kỳ này đã tồn tại.");
      }
      return sendError(res, 500, "Lỗi máy chủ nội bộ.");
    }
    return sendSuccess(res, { message: "Thêm kỳ thành công" }, 201);
  });
};
const router$3 = express.Router();
router$3.get("/", getAllSemesters);
router$3.post("/", createSemester);
const getAllAcademicPeriods = (_req, res) => {
  const query = `
    SELECT a.*, s.semester as semester_name
    FROM academic_periods a
    LEFT JOIN semesters s ON a.semester = s.id
    ORDER BY a.created_at DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return sendError(res, 500, "Lỗi máy chủ nội bộ.");
    }
    const now = /* @__PURE__ */ new Date();
    const periodsToUpdate = rows.filter((row) => {
      if (row.is_active === 1 && new Date(row.end_date) < now) {
        row.is_active = 0;
        return true;
      }
      return false;
    });
    if (periodsToUpdate.length === 0) {
      return sendSuccess(res, rows);
    }
    const updateStmt = db.prepare(
      "UPDATE academic_periods SET is_active = 0 WHERE id = ?"
    );
    periodsToUpdate.forEach((period) => {
      updateStmt.run(period.id);
    });
    updateStmt.finalize((updateErr) => {
      if (updateErr) {
        console.error("Database error:", updateErr);
        return sendError(res, 500, "Lỗi máy chủ nội bộ.");
      }
      return sendSuccess(res, rows);
    });
  });
};
const createAcademicPeriod = (req, res) => {
  const { semester, period_type, start_date, end_date } = req.body;
  if (!semester || !period_type || !start_date || !end_date) {
    return sendError(res, 400, "Vui lòng cung cấp đầy đủ thông tin.");
  }
  db.run(
    "UPDATE academic_periods SET is_active = 0 WHERE is_active = 1",
    (updateErr) => {
      if (updateErr) {
        console.error("Database error:", updateErr);
        return sendError(res, 500, "Lỗi máy chủ nội bộ.");
      }
      const insertQuery = `
        INSERT INTO academic_periods (semester, period_type, start_date, end_date, is_active)
        VALUES (?, ?, ?, ?, 1)
      `;
      db.run(
        insertQuery,
        [semester, period_type, start_date, end_date],
        function insertPeriod(insertErr) {
          if (insertErr) {
            console.error("Database error:", insertErr);
            return sendError(res, 500, "Lỗi máy chủ nội bộ.");
          }
          return sendSuccess(
            res,
            { id: this.lastID },
            "Tạo kế hoạch đăng ký thành công.",
            201
          );
        }
      );
    }
  );
};
const updateAcademicPeriod = (req, res) => {
  const { id } = req.params;
  const { semester, period_type, start_date, end_date } = req.body;
  if (!semester || !period_type || !start_date || !end_date) {
    return sendError(res, 400, "Vui lòng cung cấp đầy đủ thông tin.");
  }
  const updateQuery = `
    UPDATE academic_periods 
    SET semester = ?, period_type = ?, start_date = ?, end_date = ?
    WHERE id = ?
  `;
  db.run(updateQuery, [semester, period_type, start_date, end_date, id], function(err) {
    if (err) {
      console.error("Database error:", err);
      return sendError(res, 500, "Lỗi máy chủ nội bộ.");
    }
    return sendSuccess(res, null, "Cập nhật kế hoạch đăng ký thành công.");
  });
};
const deleteAcademicPeriod = (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM academic_periods WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("Database error:", err);
      return sendError(res, 500, "Lỗi máy chủ nội bộ.");
    }
    return sendSuccess(res, null, "Xóa kế hoạch đăng ký thành công.");
  });
};
const router$2 = express.Router();
router$2.get("/", getAllAcademicPeriods);
router$2.post("/", createAcademicPeriod);
router$2.put("/:id", updateAcademicPeriod);
router$2.delete("/:id", deleteAcademicPeriod);
function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}
function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function runCallback(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}
async function ensureStudentCourseStatusColumn() {
  const columns = await dbAll("PRAGMA table_info(student_courses)");
  const hasStatus = columns.some((column) => column.name === "status");
  if (!hasStatus) {
    await dbRun("ALTER TABLE student_courses ADD COLUMN status TEXT DEFAULT 'registered'");
  }
}
async function ensureStudentRecord(studentId) {
  const account = await dbGet(
    "SELECT id FROM accounts WHERE id = ? AND role = 'student'",
    [studentId]
  );
  if (!account) {
    throw new Error("Không tìm thấy tài khoản sinh viên.");
  }
  const student = await dbGet(
    "SELECT id FROM students WHERE id = ?",
    [studentId]
  );
  if (!student) {
    await dbRun("INSERT INTO students (id, status) VALUES (?, 'study')", [
      studentId
    ]);
  }
}
async function getStudentProfile(studentId) {
  const profile = await dbGet(
    `
      SELECT id, name, username, id_card
      FROM accounts
      WHERE id = ? AND role = 'student'
    `,
    [studentId]
  );
  if (!profile) {
    throw new Error("Không tìm thấy tài khoản sinh viên.");
  }
  return profile;
}
async function getStudentProgramId(studentId) {
  const assignedProgram = await dbGet(
    `
      SELECT c.program_id as programId
      FROM classes_student cs
      JOIN classes c ON c.id = cs.id_class
      WHERE cs.id_account = ?
      LIMIT 1
    `,
    [studentId]
  );
  if (assignedProgram?.programId) {
    return assignedProgram.programId;
  }
  const fallbackProgram = await dbGet(
    "SELECT id FROM programs ORDER BY id LIMIT 1"
  );
  if (!fallbackProgram) {
    throw new Error("Chưa có chương trình đào tạo trong cơ sở dữ liệu.");
  }
  return fallbackProgram.id;
}
async function getCompletedCourseIds(studentId) {
  await ensureStudentCourseStatusColumn();
  const rows = await dbAll(
    `
      SELECT course_id
      FROM student_courses
      WHERE student_id = ? AND status = 'completed'
    `,
    [studentId]
  );
  return new Set(rows.map((row) => row.course_id));
}
function getCourseStatusLabel(status) {
  switch (status) {
    case "completed":
      return "Đã học xong. Có thể học lại";
    case "registered":
      return "Đã từng đăng ký, chưa học xong";
    case "blocked":
      return "Chưa đủ điều kiện";
    default:
      return "Có thể đăng ký";
  }
}
async function getCurriculumRows(studentId) {
  await ensureStudentCourseStatusColumn();
  const programId = await getStudentProgramId(studentId);
  const rows = await dbAll(
    `
      WITH student_course_state AS (
        SELECT
          course_id,
          CASE
            WHEN SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) > 0 THEN 'completed'
            WHEN SUM(CASE WHEN COALESCE(status, 'registered') IN ('registered', 're_registered') THEN 1 ELSE 0 END) > 0 THEN 'registered'
            ELSE NULL
          END as registrationStatus,
          (SELECT COALESCE(status, 'registered') FROM student_courses sc2 WHERE sc2.course_id = student_courses.course_id AND sc2.student_id = student_courses.student_id ORDER BY id DESC LIMIT 1) as latestStatus
        FROM student_courses
        WHERE student_id = ?
        GROUP BY course_id
      )
      SELECT
        pc.id as curriculumId,
        pc.course_id as courseId,
        pc.prerequisite_course_id as prerequisiteCourseId,
        pc.parallel_course_id as parallelCourseId,
        c.course_code as code,
        c.course_name as name,
        c.credits,
        pre.course_code as prerequisiteCode,
        pre.course_name as prerequisiteName,
        par.course_code as parallelCode,
        par.course_name as parallelName,
        sc.registrationStatus,
        sc.latestStatus
      FROM program_course pc
      JOIN courses c ON c.id = pc.course_id
      LEFT JOIN courses pre ON pre.id = pc.prerequisite_course_id
      LEFT JOIN courses par ON par.id = pc.parallel_course_id
      LEFT JOIN student_course_state sc ON sc.course_id = pc.course_id
      WHERE pc.program_id = ?
      ORDER BY c.course_code ASC
    `,
    [studentId, programId]
  );
  const completedCourseIds = await getCompletedCourseIds(studentId);
  const courses = rows.map((row) => {
    const hasMissingPrerequisite = row.prerequisiteCourseId && !completedCourseIds.has(row.prerequisiteCourseId);
    const status = row.registrationStatus === "completed" ? "completed" : row.registrationStatus ? "registered" : hasMissingPrerequisite ? "blocked" : "available";
    const hasStudied = status === "completed";
    return {
      ...row,
      latestStatus: row.latestStatus,
      status,
      statusLabel: getCourseStatusLabel(status),
      hasStudied,
      studyStatusLabel: hasStudied ? "Đã học" : "Chưa học",
      canRegister: status === "available",
      blockingReason: hasMissingPrerequisite ? `Thiếu học phần tiên quyết ${row.prerequisiteCode}-${row.prerequisiteName} chưa hoàn thành` : null
    };
  });
  const courseMap = new Map(courses.map((c) => [c.courseId, c]));
  courses.forEach((c) => {
    if (c.parallelCourseId) {
      const parCourse = courseMap.get(c.parallelCourseId);
      c.parallelCourseRawStatus = parCourse ? parCourse.latestStatus : null;
    } else {
      c.parallelCourseRawStatus = null;
    }
  });
  return courses;
}
async function getCurriculum(studentId) {
  const profile = await getStudentProfile(studentId);
  const programId = await getStudentProgramId(studentId);
  const program = await dbGet(
    `
      SELECT p.id, p.program_code as code, p.program_name as name
      FROM programs p
      WHERE p.id = ?
    `,
    [programId]
  );
  return {
    student: profile,
    program,
    courses: await getCurriculumRows(studentId)
  };
}
async function getActiveRegistrationPeriod(expectedType) {
  const rows = await dbAll(
    `
      SELECT id, semester, period_type, start_date, end_date, is_active
      FROM academic_periods
      WHERE is_active = 1
      ORDER BY id DESC
    `
  );
  const now = /* @__PURE__ */ new Date();
  return rows.find((row) => {
    const start = new Date(String(row.start_date).replace(" ", "T"));
    const end = new Date(String(row.end_date).replace(" ", "T"));
    return row.period_type === expectedType && now >= start && now <= end;
  }) ?? null;
}
function parseSchedule(detailStr) {
  try {
    const parsed = JSON.parse(detailStr || "{}");
    let slots = [];
    if (Array.isArray(parsed)) slots = parsed;
    else if (parsed.slots && Array.isArray(parsed.slots)) slots = parsed.slots;
    if (slots.length > 0) {
      return slots.map((s) => ({
        day: String(s.day).replace("T", ""),
        periods: Array.isArray(s.periods) ? s.periods.map(Number) : [Number(s.period)]
      }));
    } else if (parsed.thu && parsed.tiet_bd && parsed.tiet_kt) {
      const start = Number(parsed.tiet_bd);
      const end = Number(parsed.tiet_kt);
      const periods = [];
      for (let i = start; i <= end; i++) periods.push(i);
      return [{
        day: String(parsed.thu),
        periods
      }];
    }
  } catch {
  }
  return [];
}
class ValidationContext {
  strategies = [];
  addStrategy(strategy) {
    this.strategies.push(strategy);
  }
  async validateAll(contextData) {
    for (const strategy of this.strategies) {
      await strategy.validate(contextData);
    }
  }
}
class SkipValidationException extends Error {
  constructor() {
    super("SKIP");
    this.name = "SkipValidationException";
  }
}
class CurriculumCourseStrategy {
  async validate(context) {
    const curriculumCourse = context.courseMap.get(context.targetCourseId);
    if (!curriculumCourse) {
      if (!context.isAutoAdd) throw new Error("Học phần không thuộc chương trình đào tạo của sinh viên.");
      throw new SkipValidationException();
    }
    context.curriculumCourse = curriculumCourse;
  }
}
class PrerequisiteCourseStrategy {
  async validate(context) {
    if (!context.curriculumCourse) {
      throw new Error("Thiếu thông tin học phần.");
    }
    if (context.curriculumCourse.blockingReason) {
      throw new Error(`Học phần tiên quyết ${context.curriculumCourse.prerequisiteCode}-${context.curriculumCourse.prerequisiteName} chưa hoàn thành`);
    }
  }
}
class DuplicateCourseSemesterStrategy {
  async validate(context) {
    const existingInSemester = await dbGet(
      `SELECT id FROM student_courses WHERE student_id = ? AND course_id = ? AND semester = ? LIMIT 1`,
      [context.studentId, context.targetCourseId, context.activePeriod.semester]
    );
    if (existingInSemester) {
      if (!context.isAutoAdd) throw new Error("Bạn đã đăng ký thành công trước đó");
      throw new SkipValidationException();
    }
  }
}
async function getRegisteredCourses(studentId) {
  await ensureStudentCourseStatusColumn();
  return dbAll(
    `
      SELECT
        sc.id,
        sc.course_id as courseId,
        sc.semester,
        COALESCE(sc.status, 'registered') as status,
        c.course_code as code,
        c.course_name as name,
        c.credits
      FROM student_courses sc
      JOIN courses c ON c.id = sc.course_id
      WHERE sc.student_id = ?
      ORDER BY sc.created_at DESC, sc.id DESC
    `,
    [studentId]
  );
}
async function searchCourseSuggestions(studentId, query, limit = 10) {
  const normalized = query.trim().toLowerCase();
  const curriculum = await getCurriculumRows(studentId);
  return curriculum.filter(
    (course) => !normalized || course.code.toLowerCase().includes(normalized) || course.name.toLowerCase().includes(normalized)
  ).slice(0, limit);
}
async function registerCourse(studentId, input) {
  await ensureStudentRecord(studentId);
  await ensureStudentCourseStatusColumn();
  const activePeriod = await getActiveRegistrationPeriod("register_program");
  if (!activePeriod) {
    throw new Error("Hiện không trong giai đoạn đăng ký học phần.");
  }
  const course = input.courseId ? await dbGet("SELECT * FROM courses WHERE id = ?", [input.courseId]) : await dbGet("SELECT * FROM courses WHERE course_code = ?", [
    input.courseCode
  ]);
  if (!course) {
    throw new Error("Học phần không tồn tại.");
  }
  const curriculumCourses = await getCurriculumRows(studentId);
  const courseMap = new Map(curriculumCourses.map((c) => [c.courseId, c]));
  const collectedToRegister = /* @__PURE__ */ new Map();
  const autoAddedNames = [];
  async function collectAsync(targetCourseId, isAutoAdd, depth = 0) {
    if (depth > 10) throw new Error("Phát hiện vòng lặp đệ quy học phần song hành.");
    if (collectedToRegister.has(targetCourseId)) return;
    const validationContext = new ValidationContext();
    validationContext.addStrategy(new CurriculumCourseStrategy());
    validationContext.addStrategy(new PrerequisiteCourseStrategy());
    validationContext.addStrategy(new DuplicateCourseSemesterStrategy());
    const courseContext = {
      studentId,
      targetCourseId,
      isAutoAdd,
      activePeriod,
      courseMap
    };
    try {
      await validationContext.validateAll(courseContext);
    } catch (error) {
      if (error instanceof SkipValidationException) {
        return;
      }
      throw error;
    }
    const curriculumCourse = courseContext.curriculumCourse;
    collectedToRegister.set(targetCourseId, curriculumCourse);
    if (isAutoAdd) {
      autoAddedNames.push(`${curriculumCourse.code}-${curriculumCourse.name}`);
    }
    if (curriculumCourse.parallelCourseId) {
      const parStatus = curriculumCourse.parallelCourseRawStatus;
      if (parStatus !== "completed" && parStatus !== "re_registered") {
        await collectAsync(curriculumCourse.parallelCourseId, true, depth + 1);
      }
    }
  }
  await collectAsync(course.id, false);
  let primaryRegisteredCourse = null;
  let primaryMessage = "Đăng ký thành công";
  for (const [cId, cCourse] of collectedToRegister) {
    const existingRegisteredOtherSemester = await dbGet(
      `SELECT id FROM student_courses WHERE student_id = ? AND course_id = ? AND status = 'registered' LIMIT 1`,
      [studentId, cId]
    );
    const existingCompleted = await dbGet(
      `SELECT id FROM student_courses WHERE student_id = ? AND course_id = ? AND status = 'completed' LIMIT 1`,
      [studentId, cId]
    );
    let newStatus = "registered";
    let msg = "Đăng ký thành công";
    if (existingCompleted) {
      newStatus = "re_registered";
      msg = "Đăng ký thành công. Học phần này đã từng được học, bạn đang đăng ký học lại.";
    } else if (existingRegisteredOtherSemester) {
      newStatus = "registered";
      msg = "Đăng ký thành công. Học phần này đã từng được đăng ký nhưng chưa học xong.";
    }
    const result = await dbRun(
      `INSERT INTO student_courses (student_id, course_id, semester, status) VALUES (?, ?, ?, ?)`,
      [studentId, cId, activePeriod.semester, newStatus]
    );
    if (cId === course.id) {
      primaryRegisteredCourse = (await getRegisteredCourses(studentId)).find(
        (item) => item.id === result.lastID
      );
      primaryMessage = msg;
    }
  }
  if (autoAddedNames.length > 0) {
    primaryMessage = `Đã tự động thêm học phần song hành ${autoAddedNames.join(", ")}`;
  }
  return {
    course: primaryRegisteredCourse,
    message: primaryMessage
  };
}
async function removeCourseRegistration(studentId, courseId) {
  await ensureStudentRecord(studentId);
  const activePeriod = await getActiveRegistrationPeriod("register_program");
  if (!activePeriod) {
    throw new Error("Hiện không trong giai đoạn đăng ký học phần.");
  }
  const result = await dbRun(
    `
      DELETE FROM student_courses
      WHERE student_id = ?
        AND course_id = ?
        AND semester = ?
    `,
    [studentId, courseId, activePeriod.semester]
  );
  if (result.changes === 0) {
    throw new Error("Không tìm thấy đăng ký học phần này trong học kỳ hiện tại.");
  }
}
class ActivePeriodClassStrategy {
  async validate(context) {
    const activePeriod = await getActiveRegistrationPeriod("register_class");
    if (!activePeriod) {
      throw new Error("Hiện không trong giai đoạn đăng ký lớp học.");
    }
  }
}
class ClassCapacityStrategy {
  async validate(context) {
    const classSection = await dbGet(
      `
              SELECT
                id,
                course_id as courseId,
                total_slots as totalSlots,
                occupied_slots as occupiedSlots,
                detail
              FROM classes_course
              WHERE id = ?
            `,
      [context.classId]
    );
    if (!classSection) {
      throw new Error("Lớp học phần không tồn tại.");
    }
    if (classSection.occupiedSlots >= classSection.totalSlots) {
      throw new Error("Lớp học phần đã hết chỗ.");
    }
    context.classSection = classSection;
  }
}
class CourseRegisteredStrategy {
  async validate(context) {
    if (!context.classSection) {
      throw new Error("Thiếu thông tin lớp học phần.");
    }
    const registeredCourse = await dbGet(
      `
              SELECT id
              FROM student_courses
              WHERE student_id = ?
                AND course_id = ?
                AND COALESCE(status, 'registered') = 'registered'
              LIMIT 1
            `,
      [context.studentId, context.classSection.courseId]
    );
    if (!registeredCourse) {
      throw new Error("Sinh viên chưa đăng ký học phần của lớp này.");
    }
  }
}
class DuplicateClassStrategy {
  async validate(context) {
    if (!context.classSection) {
      throw new Error("Thiếu thông tin lớp học phần.");
    }
    const existingCourseClass = await dbGet(
      `
              SELECT scr.id
              FROM student_class_registrations scr
              JOIN classes_course cc ON cc.id = scr.class_id
              WHERE scr.student_id = ? AND cc.course_id = ?
              LIMIT 1
            `,
      [context.studentId, context.classSection.courseId]
    );
    if (existingCourseClass) {
      throw new Error("Bạn đã đăng ký một lớp khác của học phần này.");
    }
    const existingExactClass = await dbGet(
      `
              SELECT id
              FROM student_class_registrations
              WHERE student_id = ? AND class_id = ?
              LIMIT 1
            `,
      [context.studentId, context.classId]
    );
    if (existingExactClass) {
      throw new Error("Lớp học phần này đã được đăng ký.");
    }
  }
}
class TimeOverlapStrategy {
  async validate(context) {
    if (!context.classSection) {
      throw new Error("Thiếu thông tin lớp học phần.");
    }
    const classDetailObj = JSON.parse(context.classSection.detail || "{}");
    const classBuoi = classDetailObj.buoi;
    const classSlots = parseSchedule(context.classSection.detail);
    for (const slot of classSlots) {
      if (!slot.periods || slot.periods.length === 0) continue;
      const startPeriod = Math.min(...slot.periods);
      const endPeriod = Math.max(...slot.periods);
      const day = String(slot.day);
      const overlapQuery = `
              SELECT co.course_code, co.course_name
              FROM student_class_registrations scr
              JOIN classes_course c ON scr.class_id = c.id
              JOIN courses co ON c.course_id = co.id
              WHERE scr.student_id = ?
                AND CAST(json_extract(c.detail, '$.thu') AS TEXT) = ?
                AND CAST(json_extract(c.detail, '$.buoi') AS TEXT) = ?
                AND CAST(json_extract(c.detail, '$.tiet_bd') AS INTEGER) <= ?
                AND CAST(json_extract(c.detail, '$.tiet_kt') AS INTEGER) >= ?
              LIMIT 1
            `;
      const overlap = await dbGet(overlapQuery, [
        context.studentId,
        day,
        classBuoi,
        endPeriod,
        startPeriod
      ]);
      if (overlap) {
        throw new Error(`Trùng lịch với lớp ${overlap.course_code} (${overlap.course_name}).`);
      }
    }
  }
}
class EventBusImpl {
  emitter = new events.EventEmitter();
  publish(event) {
    this.emitter.emit(event.eventName, event);
  }
  subscribe(eventName, handler) {
    this.emitter.on(eventName, handler);
  }
}
const BackendEventBus = new EventBusImpl();
class ClassRegisteredEvent {
  constructor(studentId, classId) {
    this.studentId = studentId;
    this.classId = classId;
    this.occurredOn = /* @__PURE__ */ new Date();
  }
  eventName = "ClassRegisteredEvent";
  occurredOn;
}
class ClassRegistrationCancelledEvent {
  constructor(studentId, classId) {
    this.studentId = studentId;
    this.classId = classId;
    this.occurredOn = /* @__PURE__ */ new Date();
  }
  eventName = "ClassRegistrationCancelledEvent";
  occurredOn;
}
async function searchClassSuggestions(studentId, query, limit = 10) {
  await ensureStudentCourseStatusColumn();
  const normalized = query.trim().toLowerCase();
  return dbAll(
    `
      SELECT DISTINCT
        cc.id,
        cc.course_id as courseId,
        c.course_code as code,
        c.course_name as name,
        c.credits,
        cc.detail,
        cc.total_slots as totalSlots,
        cc.occupied_slots as occupiedSlots
      FROM classes_course cc
      JOIN courses c ON c.id = cc.course_id
      JOIN student_courses sc
        ON sc.course_id = cc.course_id
        AND sc.student_id = ?
        AND COALESCE(sc.status, 'registered') IN ('registered', 're_registered')
      WHERE ? = '' OR lower(c.course_code) LIKE ? OR lower(c.course_name) LIKE ?
      ORDER BY c.course_code ASC
      LIMIT ?
    `,
    [studentId, normalized, `%${normalized}%`, `%${normalized}%`, limit]
  );
}
async function getClassesForCourse(studentId, courseId) {
  await ensureStudentCourseStatusColumn();
  return dbAll(
    `
      SELECT DISTINCT
        cc.id,
        cc.course_id as courseId,
        c.course_code as code,
        c.course_name as name,
        c.credits,
        cc.detail,
        cc.total_slots as totalSlots,
        cc.occupied_slots as occupiedSlots
      FROM classes_course cc
      JOIN courses c ON c.id = cc.course_id
      JOIN student_courses sc
        ON sc.course_id = cc.course_id
        AND sc.student_id = ?
        AND COALESCE(sc.status, 'registered') IN ('registered', 're_registered')
      WHERE cc.course_id = ?
      ORDER BY cc.id ASC
    `,
    [studentId, courseId]
  );
}
async function registerClassSection(studentId, classId) {
  await ensureStudentRecord(studentId);
  const context = new ValidationContext();
  context.addStrategy(new ActivePeriodClassStrategy());
  context.addStrategy(new ClassCapacityStrategy());
  context.addStrategy(new CourseRegisteredStrategy());
  context.addStrategy(new DuplicateClassStrategy());
  context.addStrategy(new TimeOverlapStrategy());
  const registrationContext = {
    studentId,
    classId
  };
  await context.validateAll(registrationContext);
  try {
    await dbRun("BEGIN IMMEDIATE TRANSACTION");
    const result = await dbRun(
      `
        INSERT INTO student_class_registrations (student_id, class_id)
        VALUES (?, ?)
      `,
      [studentId, classId]
    );
    await dbRun(
      `
        UPDATE classes_course
        SET occupied_slots = occupied_slots + 1
        WHERE id = ?
      `,
      [classId]
    );
    await dbRun("COMMIT");
    BackendEventBus.publish(new ClassRegisteredEvent(studentId, classId));
    return { id: result.lastID };
  } catch (error) {
    try {
      await dbRun("ROLLBACK");
    } catch (_rollbackError) {
    }
    throw error;
  }
}
async function removeClassRegistration(studentId, classId) {
  await ensureStudentRecord(studentId);
  const activePeriod = await getActiveRegistrationPeriod("register_class");
  if (!activePeriod) {
    throw new Error("Hiện không trong giai đoạn đăng ký lớp học.");
  }
  try {
    await dbRun("BEGIN IMMEDIATE TRANSACTION");
    const result = await dbRun(
      `
        DELETE FROM student_class_registrations
        WHERE student_id = ? AND class_id = ?
      `,
      [studentId, classId]
    );
    if (result.changes === 0) {
      throw new Error("Không tìm thấy đăng ký lớp học phần này.");
    }
    await dbRun(
      `
        UPDATE classes_course
        SET occupied_slots = MAX(0, occupied_slots - 1)
        WHERE id = ?
      `,
      [classId]
    );
    await dbRun("COMMIT");
    BackendEventBus.publish(new ClassRegistrationCancelledEvent(studentId, classId));
  } catch (error) {
    try {
      await dbRun("ROLLBACK");
    } catch (_rollbackError) {
    }
    throw error;
  }
}
async function getTimetable(studentId, semester) {
  let query = `
      SELECT
        scr.id,
        cc.id as classId,
        c.course_code as code,
        c.course_name as name,
        cc.detail
      FROM student_class_registrations scr
      JOIN classes_course cc ON cc.id = scr.class_id
      JOIN courses c ON c.id = cc.course_id
  `;
  const params = [studentId];
  if (semester) {
    query += `
      JOIN student_courses sc ON sc.course_id = c.id AND sc.student_id = scr.student_id
      WHERE scr.student_id = ? AND sc.semester = ?
    `;
    params.push(semester);
  } else {
    query += ` WHERE scr.student_id = ? `;
  }
  query += ` ORDER BY c.course_code ASC `;
  return dbAll(query, params);
}
function parseStudentId(req) {
  const studentId = Number(req.params.studentId);
  if (!Number.isInteger(studentId) || studentId <= 0) {
    throw new Error("Mã sinh viên không hợp lệ.");
  }
  return studentId;
}
function handleRouteError(res, err, fallbackMessage) {
  const message = err instanceof Error ? err.message : fallbackMessage;
  const status = message.includes("không tìm thấy") || message.includes("không tồn tại") ? 404 : 400;
  return sendError(res, status, message || fallbackMessage);
}
async function getStudentCurriculum(req, res) {
  try {
    return sendSuccess(res, await getCurriculum(parseStudentId(req)));
  } catch (err) {
    console.error("getStudentCurriculum error:", err);
    return handleRouteError(res, err, "Không thể lấy chương trình đào tạo.");
  }
}
async function getStudentRegisteredCourses(req, res) {
  try {
    return sendSuccess(res, await getRegisteredCourses(parseStudentId(req)));
  } catch (err) {
    console.error("getStudentRegisteredCourses error:", err);
    return handleRouteError(res, err, "Không thể lấy học phần đã đăng ký.");
  }
}
async function getCourseSuggestions(req, res) {
  try {
    const query = String(req.query.q ?? "");
    const limit = Number(req.query.limit ?? 10);
    return sendSuccess(
      res,
      await searchCourseSuggestions(parseStudentId(req), query, limit)
    );
  } catch (err) {
    console.error("getCourseSuggestions error:", err);
    return handleRouteError(res, err, "Không thể tìm gợi ý học phần.");
  }
}
async function createCourseRegistration(req, res) {
  try {
    const result = await registerCourse(parseStudentId(req), req.body);
    return sendSuccess(
      res,
      result
    );
  } catch (err) {
    console.error("createCourseRegistration error:", err);
    return handleRouteError(res, err, "Không thể đăng ký học phần.");
  }
}
async function deleteCourseRegistration(req, res) {
  try {
    const courseId = Number(req.params.courseId);
    if (!Number.isInteger(courseId)) {
      throw new Error("Mã học phần không hợp lệ.");
    }
    await removeCourseRegistration(parseStudentId(req), courseId);
    return sendSuccess(res, null, "Xoá đăng ký học phần thành công.");
  } catch (err) {
    console.error("deleteCourseRegistration error:", err);
    return handleRouteError(res, err, "Không thể xoá đăng ký học phần.");
  }
}
async function getClassSuggestions(req, res) {
  try {
    const query = String(req.query.q ?? "");
    const limit = Number(req.query.limit ?? 10);
    return sendSuccess(
      res,
      await searchClassSuggestions(parseStudentId(req), query, limit)
    );
  } catch (err) {
    console.error("getClassSuggestions error:", err);
    return handleRouteError(res, err, "Không thể tìm gợi ý lớp học phần.");
  }
}
async function getCourseClasses(req, res) {
  try {
    const courseId = Number(req.params.courseId);
    if (!Number.isInteger(courseId)) {
      throw new Error("Mã học phần không hợp lệ.");
    }
    return sendSuccess(
      res,
      await getClassesForCourse(parseStudentId(req), courseId)
    );
  } catch (err) {
    console.error("getCourseClasses error:", err);
    return handleRouteError(res, err, "Không thể lấy danh sách lớp học phần.");
  }
}
async function createClassRegistration(req, res) {
  try {
    return sendSuccess(
      res,
      await registerClassSection(parseStudentId(req), Number(req.body.classId)),
      "Đăng ký lớp học phần thành công."
    );
  } catch (err) {
    console.error("createClassRegistration error:", err);
    return handleRouteError(res, err, "Không thể đăng ký lớp học phần.");
  }
}
async function getStudentTimetable(req, res) {
  try {
    const semester = req.query.semesterId ? String(req.query.semesterId) : void 0;
    return sendSuccess(res, await getTimetable(parseStudentId(req), semester));
  } catch (err) {
    console.error("getStudentTimetable error:", err);
    return handleRouteError(res, err, "Không thể lấy thời khóa biểu.");
  }
}
async function deleteClassRegistration(req, res) {
  try {
    const classId = Number(req.params.classId);
    if (!Number.isInteger(classId)) {
      throw new Error("Mã lớp học phần không hợp lệ.");
    }
    await removeClassRegistration(parseStudentId(req), classId);
    return sendSuccess(res, null, "Xoá đăng ký lớp học phần thành công.");
  } catch (err) {
    console.error("deleteClassRegistration error:", err);
    return handleRouteError(res, err, "Không thể xoá đăng ký lớp học phần.");
  }
}
const router$1 = express.Router();
router$1.get("/:studentId/curriculum", getStudentCurriculum);
router$1.get("/:studentId/registered-courses", getStudentRegisteredCourses);
router$1.get("/:studentId/course-suggestions", getCourseSuggestions);
router$1.post("/:studentId/course-registrations", createCourseRegistration);
router$1.delete("/:studentId/course-registrations/:courseId", deleteCourseRegistration);
router$1.get("/:studentId/courses/:courseId/classes", getCourseClasses);
router$1.get("/:studentId/class-suggestions", getClassSuggestions);
router$1.post("/:studentId/class-registrations", createClassRegistration);
router$1.delete("/:studentId/class-registrations/:classId", deleteClassRegistration);
router$1.get("/:studentId/timetable", getStudentTimetable);
class AdminService {
  getCourseRegistrationStats(semester) {
    return new Promise((resolve, reject) => {
      const query = `
                SELECT 
                    c.id AS course_id,
                    c.course_code AS ma_hp,
                    c.course_name AS ten_hp,
                    m.major_name AS truong_khoa,
                    COUNT(sc.student_id) AS so_luong_dang_ky,
                    COALESCE(cls.so_luong_lop, 0) AS so_luong_lop,
                    COALESCE(cls.so_luong_dk_toi_da, 0) AS so_luong_dk_toi_da
                FROM courses c
                JOIN student_courses sc ON c.id = sc.course_id
                LEFT JOIN (
                    SELECT course_id, MIN(program_id) as program_id 
                    FROM program_course 
                    GROUP BY course_id
                ) pc ON c.id = pc.course_id
                LEFT JOIN programs p ON pc.program_id = p.id
                LEFT JOIN majors m ON p.major_id = m.id
                LEFT JOIN (
                    SELECT course_id, COUNT(id) as so_luong_lop, SUM(total_slots) as so_luong_dk_toi_da
                    FROM classes_course
                    WHERE semester = ?
                    GROUP BY course_id
                ) cls ON c.id = cls.course_id
                WHERE sc.semester = ?
                GROUP BY c.id, c.course_code, c.course_name, m.major_name, cls.so_luong_lop, cls.so_luong_dk_toi_da
            `;
      db.all(query, [semester, semester], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
  createClassCourse(data) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT id FROM semesters WHERE semester = ?`, [data.ky], (err, row1) => {
        if (err) return reject(err);
        if (!row1) return reject(new Error("Không tìm thấy kỳ học"));
        const semester_id = row1.id;
        db.get(`SELECT id FROM courses WHERE course_code = ?`, [data.ma_hp], (err2, row2) => {
          if (err2) return reject(err2);
          if (!row2) return reject(new Error("Không tìm thấy học phần"));
          const course_id = row2.id;
          const detailJSON = JSON.stringify({
            ma_lop: data.ma_lop,
            ma_lop_kem: data.ma_lop_kem,
            ghi_chu: data.ghi_chu,
            thu: data.thu,
            tiet_bd: data.tiet_bd,
            tiet_kt: data.tiet_kt,
            buoi: data.buoi,
            phong_hoc: data.phong_hoc,
            can_tn: data.can_tn,
            teaching_type: data.teaching_type
          });
          const query = `
                        INSERT INTO classes_course (course_id, semester, detail, total_slots, occupied_slots)
                        VALUES (?, ?, ?, ?, 0)
                    `;
          db.run(query, [course_id, semester_id, detailJSON, data.sl_max || 0], function(err3) {
            if (err3) return reject(err3);
            resolve();
          });
        });
      });
    });
  }
  updateClassCourse(id, data) {
    return new Promise((resolve, reject) => {
      const detailJSON = JSON.stringify({
        ma_lop: data.ma_lop,
        ma_lop_kem: data.ma_lop_kem,
        ghi_chu: data.ghi_chu,
        thu: data.thu,
        tiet_bd: data.tiet_bd,
        tiet_kt: data.tiet_kt,
        buoi: data.buoi,
        phong_hoc: data.phong_hoc,
        can_tn: data.can_tn,
        teaching_type: data.teaching_type
      });
      const query = `
                UPDATE classes_course 
                SET detail = ?, total_slots = ?
                WHERE id = ?
            `;
      db.run(query, [detailJSON, data.sl_max || 0, id], function(err) {
        if (err) return reject(err);
        resolve();
      });
    });
  }
  getClassesByCourse(semester, courseId) {
    return new Promise((resolve, reject) => {
      const query = `
                SELECT 
                    id AS class_id,
                    total_slots AS sl_max,
                    occupied_slots AS sl_dk,
                    detail
                FROM classes_course
                WHERE semester = ? AND course_id = ?
            `;
      db.all(query, [semester, courseId], (err, rows) => {
        if (err) return reject(err);
        const formattedRows = rows.map((row) => {
          let detailObj = {};
          try {
            detailObj = JSON.parse(row.detail || "{}");
          } catch (e) {
          }
          return {
            id: row.class_id,
            sl_max: row.sl_max,
            sl_dk: row.sl_dk,
            ...detailObj
          };
        });
        resolve(formattedRows);
      });
    });
  }
  deleteClassCourse(classId) {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM classes_course WHERE id = ?`;
      db.run(query, [classId], function(err) {
        if (err) return reject(err);
        resolve();
      });
    });
  }
  getAllClassesBySemester(semester) {
    return new Promise((resolve, reject) => {
      const query = `
                SELECT 
                    cc.id AS class_id,
                    c.course_code AS ma_hp,
                    c.course_name AS ten_hp,
                    c.credits AS khoi_luong,
                    m.major_name AS khoa_truong,
                    cc.total_slots AS sl_max,
                    cc.occupied_slots AS sl_dk,
                    s.semester AS ky_hoc,
                    cc.detail
                FROM classes_course cc
                JOIN courses c ON cc.course_id = c.id
                JOIN semesters s ON cc.semester = s.id
                LEFT JOIN (
                    SELECT course_id, MIN(program_id) as program_id 
                    FROM program_course 
                    GROUP BY course_id
                ) pc ON c.id = pc.course_id
                LEFT JOIN programs p ON pc.program_id = p.id
                LEFT JOIN majors m ON p.major_id = m.id
                WHERE cc.semester = ?
            `;
      db.all(query, [semester], (err, rows) => {
        if (err) return reject(err);
        const formattedRows = rows.map((row) => {
          let detailObj = {};
          try {
            detailObj = JSON.parse(row.detail || "{}");
          } catch (e) {
          }
          return {
            id: row.class_id,
            ky: row.ky_hoc?.toString() || "",
            ma_hp: row.ma_hp,
            ten_hp: row.ten_hp,
            khoa_truong: row.khoa_truong,
            khoi_luong: row.khoi_luong?.toString() || "",
            sl_max: row.sl_max,
            sl_dk: row.sl_dk,
            ...detailObj
          };
        });
        resolve(formattedRows);
      });
    });
  }
}
const adminService = new AdminService();
const getCourseRegistrationStats = async (req, res) => {
  try {
    const semester = Number(req.query.semester);
    if (!semester) {
      return sendError(res, 400, "Thiếu tham số semester");
    }
    const stats = await adminService.getCourseRegistrationStats(semester);
    sendSuccess(res, stats, "Lấy thống kê thành công", 200);
  } catch (error) {
    sendError(res, 500, error.message || "Lỗi hệ thống");
  }
};
const createClassCourse = async (req, res) => {
  try {
    const data = req.body;
    if (!data.ky || !data.ma_hp || !data.ma_lop || !data.sl_max) {
      return sendError(res, 400, "Thiếu thông tin bắt buộc (kỳ học, mã HP, mã lớp, SL Max)");
    }
    await adminService.createClassCourse(data);
    sendSuccess(res, null, "Tạo lớp học thành công", 201);
  } catch (error) {
    sendError(res, 500, error.message || "Lỗi hệ thống khi tạo lớp học");
  }
};
const updateClassCourse = async (req, res) => {
  try {
    const classId = Number(req.params.id);
    const data = req.body;
    if (!classId || !data.ma_lop || !data.sl_max) {
      return sendError(res, 400, "Thiếu thông tin bắt buộc (ID lớp, mã lớp, SL Max)");
    }
    await adminService.updateClassCourse(classId, data);
    sendSuccess(res, null, "Cập nhật lớp học thành công", 200);
  } catch (error) {
    sendError(res, 500, error.message || "Lỗi hệ thống khi cập nhật lớp học");
  }
};
const getClassesByCourse = async (req, res) => {
  try {
    const semester = Number(req.params.semester);
    const courseId = Number(req.params.courseId);
    if (!semester || !courseId) {
      return sendError(res, 400, "Thiếu tham số bắt buộc");
    }
    const classes = await adminService.getClassesByCourse(semester, courseId);
    sendSuccess(res, classes, "Lấy danh sách lớp thành công", 200);
  } catch (error) {
    sendError(res, 500, error.message || "Lỗi hệ thống");
  }
};
const deleteClassCourse = async (req, res) => {
  try {
    const classId = Number(req.params.id);
    if (!classId) {
      return sendError(res, 400, "Thiếu ID lớp học");
    }
    await adminService.deleteClassCourse(classId);
    sendSuccess(res, null, "Xoá lớp học thành công", 200);
  } catch (error) {
    sendError(res, 500, error.message || "Lỗi hệ thống khi xoá lớp học");
  }
};
const getAllClassesBySemester = async (req, res) => {
  try {
    const semester = Number(req.params.semester);
    if (!semester) {
      return sendError(res, 400, "Thiếu tham số kỳ học");
    }
    const classes = await adminService.getAllClassesBySemester(semester);
    sendSuccess(res, classes, "Lấy toàn bộ danh sách lớp thành công", 200);
  } catch (error) {
    sendError(res, 500, error.message || "Lỗi hệ thống");
  }
};
const router = express.Router();
router.get("/course-registration-stats", getCourseRegistrationStats);
router.post("/classes", createClassCourse);
router.put("/classes/:id", updateClassCourse);
router.get("/classes/semester/:semester", getAllClassesBySemester);
router.get("/classes/:semester/:courseId", getClassesByCourse);
router.delete("/classes/:id", deleteClassCourse);
const LOG_DIR$1 = path.join(__dirname, "../../logs");
const LOG_FILE = path.join(LOG_DIR$1, "registration_audit.log");
if (!fs.existsSync(LOG_DIR$1)) {
  fs.mkdirSync(LOG_DIR$1, { recursive: true });
}
function registerAuditLogSubscriber() {
  const handler = (event) => {
    let message = "";
    if (event instanceof ClassRegisteredEvent) {
      message = `[${event.occurredOn.toISOString()}] Student ${event.studentId} REGISTERED Class ${event.classId}
`;
    } else if (event instanceof ClassRegistrationCancelledEvent) {
      message = `[${event.occurredOn.toISOString()}] Student ${event.studentId} CANCELLED Class ${event.classId}
`;
    }
    if (message) {
      fs.appendFile(LOG_FILE, message, (err) => {
        if (err) console.error("Failed to write audit log", err);
      });
    }
  };
  BackendEventBus.subscribe("ClassRegisteredEvent", handler);
  BackendEventBus.subscribe("ClassRegistrationCancelledEvent", handler);
}
function registerClassCapacityWarningSubscriber() {
  BackendEventBus.subscribe("ClassRegisteredEvent", async (event) => {
    if (event instanceof ClassRegisteredEvent) {
      try {
        const classSection = await dbGet(
          `SELECT id, occupied_slots, total_slots FROM classes_course WHERE id = ?`,
          [event.classId]
        );
        if (classSection && classSection.occupied_slots >= classSection.total_slots) {
          console.warn(`[WARNING] Class ${event.classId} is full (${classSection.occupied_slots}/${classSection.total_slots}). Admin attention might be required.`);
        }
      } catch (err) {
        console.error("Error in ClassCapacityWarningSubscriber", err);
      }
    }
  });
}
const app = express();
registerAuditLogSubscriber();
registerClassCapacityWarningSubscriber();
app.use(cors());
app.use(express.json());
app.use("/api/auth", router$4);
app.use("/api/semesters", router$3);
app.use("/api/academic-periods", router$2);
app.use("/api/students", router$1);
app.use("/api/admin", router);
let LOG_DIR = path.join(__dirname, "../logs");
if (process.versions && process.versions.electron) {
  const { app: electronApp } = require("electron");
  LOG_DIR = path.join(electronApp.getPath("userData"), "logs");
}
const CLIENT_LOG_FILE = path.join(LOG_DIR, "client.log");
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}
app.post("/api/logs", (req, res) => {
  const { level, message, timestamp } = req.body;
  const logTime = timestamp || (/* @__PURE__ */ new Date()).toISOString();
  const logMessage = `[${logTime}] [${level || "INFO"}] ${message}
`;
  fs.appendFile(CLIENT_LOG_FILE, logMessage, (err) => {
    if (err) {
      console.error("Failed to write client log:", err);
      return sendError(res, 500, "Không thể ghi log.");
    }
    return sendSuccess(res, {});
  });
});
const logsDir = path__namespace.join(electron.app.getPath("userData"), "..", "..", "logs");
if (!fs__namespace.existsSync(logsDir)) fs__namespace.mkdirSync(logsDir, { recursive: true });
function writeLog(message) {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const logLine = `[${timestamp}] ${message}
`;
  const logFile = path__namespace.join(logsDir, "app-menu.log");
  fs__namespace.appendFileSync(logFile, logLine, "utf8");
  console.log(logLine.trim());
}
let isLoggedIn = false;
let mainWindowRef = null;
function buildAppMenu() {
  const template = [
    // macOS: first menu is the app menu (its label is replaced by the app name)
    ...process.platform === "darwin" ? [
      {
        label: electron.app.name,
        submenu: [
          { role: "about" },
          { type: "separator" },
          { role: "hide" },
          { role: "hideOthers" },
          { role: "unhide" },
          { type: "separator" }
        ]
      }
    ] : [],
    // ── Quit menu ──────────────────────────────────────────
    {
      label: "Quit",
      submenu: [
        {
          label: "Exit",
          accelerator: "CmdOrCtrl+Q",
          click: () => {
            writeLog("[MENU] User selected Exit – quitting application");
            electron.app.quit();
          }
        },
        { type: "separator" },
        {
          label: "Log Out",
          enabled: isLoggedIn,
          click: () => {
            writeLog("[MENU] User selected Log Out");
            mainWindowRef?.webContents.send("menu:logout");
          }
        }
      ]
    },
    // ── Info menu ──────────────────────────────────────────
    {
      label: "Info",
      submenu: [
        {
          label: "Về ứng dụng…",
          click: () => {
            writeLog("[MENU] User opened About dialog");
            mainWindowRef?.webContents.send("menu:show-about");
          }
        }
      ]
    }
  ];
  const menu = electron.Menu.buildFromTemplate(template);
  electron.Menu.setApplicationMenu(menu);
}
function registerIpcHandlers() {
  electron.ipcMain.on("app:set-logged-in", (_event, value) => {
    isLoggedIn = value;
    writeLog(`[IPC] Login state updated: ${isLoggedIn}`);
    buildAppMenu();
  });
}
function createWindow() {
  mainWindowRef = new electron.BrowserWindow({
    width: 1024,
    height: 768,
    show: false,
    autoHideMenuBar: false,
    // show native menu bar
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  mainWindowRef.on("ready-to-show", () => {
    mainWindowRef.show();
  });
  mainWindowRef.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindowRef.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindowRef.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.electron");
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  registerIpcHandlers();
  buildAppMenu();
  createWindow();
  try {
    const PORT = process.env.PORT || 3002;
    app.listen(PORT, () => {
      writeLog(`[SERVER] Express Server started dynamically on port ${PORT}`);
      console.log(`[SERVER] Express Server started dynamically on port ${PORT}`);
    });
  } catch (error) {
    writeLog(`[SERVER] Failed to start Express Server: ${error}`);
    console.error(`[SERVER] Failed to start Express Server:`, error);
  }
  writeLog("[APP] Application started");
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  writeLog("[APP] All windows closed");
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
