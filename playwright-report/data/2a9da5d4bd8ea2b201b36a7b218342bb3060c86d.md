# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: student-registration.spec.ts >> Student Registration Workflows >> should view timetable and register/cancel class section
- Location: tests/e2e/student-registration.spec.ts:27:9

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1')
Expected substring: "Đợt đăng ký lớp học"
Received string:    "Không có lịch đăng ký"
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('h1')
    14 × locator resolved to <h1>Không có lịch đăng ký</h1>
       - unexpected value "Không có lịch đăng ký"

```

```yaml
- heading "Không có lịch đăng ký" [level=1]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Student Registration Workflows', () => {
  4  |     test.beforeEach(async ({ page }) => {
  5  |         // Đăng nhập với tư cách sinh viên
  6  |         await page.goto('/#/login');
  7  |         await page.fill('input[placeholder="Tài khoản"]', 'student36');
  8  |         await page.fill('input[placeholder="Mật khẩu"]', 'Student36@');
  9  |         await page.click('button:has-text("Đăng nhập")');
  10 |         await expect(page).toHaveURL(/\/student/);
  11 |     });
  12 | 
  13 |     test('should view curriculum and navigate back', async ({ page }) => {
  14 |         // Click nút "Xem CTĐT"
  15 |         await page.click('button:has-text("Xem CTĐT")');
  16 |         await expect(page).toHaveURL(/\/student\/curriculum/);
  17 | 
  18 |         // Đảm bảo bảng chương trình đào tạo hiển thị
  19 |         await expect(page.locator('.page-kicker')).toHaveText('Chương trình đào tạo');
  20 |         await expect(page.locator('table.info-table')).toBeVisible();
  21 | 
  22 |         // Quay lại trang Dashboard
  23 |         await page.click('button:has-text("Quay lại")');
  24 |         await expect(page).toHaveURL(/\/student/);
  25 |     });
  26 | 
  27 |     test('should view timetable and register/cancel class section', async ({ page }) => {
  28 |         // Đợt đăng ký lớp đang mở cho học kỳ 20253
> 29 |         await expect(page.locator('h1')).toContainText('Đợt đăng ký lớp học');
     |                                          ^ Error: expect(locator).toContainText(expected) failed
  30 |         await expect(page.locator('.timetable-section')).toBeVisible();
  31 | 
  32 |         // Tìm học phần AC2020 trong danh sách đăng ký
  33 |         const row = page.locator('tr:has-text("AC2020")');
  34 |         await expect(row).toBeVisible();
  35 | 
  36 |         // Click nút expand "▶" để mở danh sách lớp học phần
  37 |         const expandBtn = row.locator('.expand-btn');
  38 |         await expandBtn.click();
  39 | 
  40 |         // Đợi bảng danh sách lớp con hiện ra
  41 |         const subTable = page.locator('table.sub-table');
  42 |         await expect(subTable).toBeVisible();
  43 | 
  44 |         // Tìm lớp "148020" và bấm "Đăng ký"
  45 |         const classRow = subTable.locator('tr:has-text("148020")');
  46 |         const registerBtn = classRow.locator('button:has-text("Đăng ký")');
  47 |         await registerBtn.click();
  48 | 
  49 |         // Xác nhận đăng ký lớp học thành công
  50 |         // Nút bấm sẽ đổi sang "Huỷ lớp"
  51 |         const cancelBtn = classRow.locator('button:has-text("Huỷ lớp")');
  52 |         await expect(cancelBtn).toBeVisible();
  53 | 
  54 |         // Kiểm tra xem thời khóa biểu tạm thời có cập nhật lớp học đó
  55 |         const timetableGrid = page.locator('.time-grid');
  56 |         await expect(timetableGrid.locator('text=AC2020')).toBeVisible();
  57 | 
  58 |         // Huỷ lớp đã đăng ký
  59 |         await cancelBtn.click();
  60 | 
  61 |         // Nút bấm chuyển lại thành "Đăng ký"
  62 |         await expect(registerBtn).toBeVisible();
  63 |     });
  64 | });
  65 | 
```