# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: student-registration.spec.ts >> Student Registration Workflows >> should view curriculum and navigate back
- Location: tests/e2e/student-registration.spec.ts:13:9

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Xem CTĐT")')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - img "Logo" [ref=e6]
      - generic [ref=e7]: Đăng ký học tập
    - generic [ref=e8]:
      - button "🌙" [ref=e9] [cursor=pointer]
      - img "Avatar" [ref=e11] [cursor=pointer]
  - main [ref=e12]:
    - generic [ref=e13]:
      - generic [ref=e14]:
        - paragraph [ref=e15]: Hệ thống đăng ký học tập
        - heading "Không có lịch đăng ký" [level=1] [ref=e16]
      - generic [ref=e17]: Đã đóng
    - generic [ref=e18]:
      - heading "Đang không có lịch đăng ký" [level=3] [ref=e19]
      - paragraph [ref=e20]: Vui lòng quay lại sau hoặc liên hệ Phòng đào tạo để biết thêm chi tiết.
    - generic [ref=e21]:
      - heading "Bảng thông tin đăng ký" [level=3] [ref=e22]
      - generic [ref=e23]:
        - table [ref=e24]:
          - rowgroup [ref=e25]:
            - row "Mã HP Tên học phần TT đăng ký Số TC" [ref=e26]:
              - columnheader "Mã HP" [ref=e27]
              - columnheader "Tên học phần" [ref=e28]
              - columnheader "TT đăng ký" [ref=e29]
              - columnheader "Số TC" [ref=e30]
          - rowgroup [ref=e31]:
            - row "Chưa có học phần đăng ký" [ref=e32]:
              - cell "Chưa có học phần đăng ký" [ref=e33]
        - generic [ref=e35]:
          - generic [ref=e36]: "Tổng số TC: 0"
          - generic [ref=e37]: "* Ghi chú: Bạn được đăng ký tối đa 24 TC"
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
> 15 |         await page.click('button:has-text("Xem CTĐT")');
     |                    ^ Error: page.click: Test timeout of 30000ms exceeded.
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
  29 |         await expect(page.locator('h1')).toContainText('Đợt đăng ký lớp học');
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