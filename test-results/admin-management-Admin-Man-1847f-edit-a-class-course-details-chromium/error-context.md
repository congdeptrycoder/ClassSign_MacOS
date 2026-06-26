# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-management.spec.ts >> Admin Management Workflows >> should edit a class course details
- Location: tests/e2e/admin-management.spec.ts:73:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('table.admin-table tbody tr').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('table.admin-table tbody tr').first()

```

```yaml
- banner:
  - img "Logo"
  - text: Quản trị hệ thống
  - button "🌙"
  - img "Avatar"
- main:
  - heading "Quản lý Giai đoạn đăng ký" [level=3]
  - button "Thêm kỳ mới"
  - button "Thêm đợt đăng ký mới"
  - table:
    - rowgroup:
      - row "Kỳ học Loại đăng ký Từ ngày Đến ngày Trạng thái Hành động":
        - columnheader "Kỳ học"
        - columnheader "Loại đăng ký"
        - columnheader "Từ ngày"
        - columnheader "Đến ngày"
        - columnheader "Trạng thái"
        - columnheader "Hành động"
    - rowgroup:
      - row "20253 Đăng ký Học phần 23:00:00 1/6/2026 23:00:00 7/7/2026 ĐÃ KẾT THÚC Xem chi tiết Sửa Xoá":
        - cell "20253"
        - cell "Đăng ký Học phần"
        - cell "23:00:00 1/6/2026"
        - cell "23:00:00 7/7/2026"
        - cell "ĐÃ KẾT THÚC"
        - cell "Xem chi tiết Sửa Xoá":
          - button "Xem chi tiết"
          - button "Sửa"
          - button "Xoá"
  - heading "Quản lý danh sách lớp học" [level=3]
  - combobox:
    - option "202862" [selected]
    - option "202265"
    - option "20253"
    - option "20252"
    - option "20251"
  - table:
    - rowgroup:
      - row "Trường/Khoa Mã lớp Mã lớp kèm Mã HP Tên HP Ghi chú Thứ Tiết BD Tiết KT Buổi Phòng học Cần TN SLDK SL Max TeachingType Hành động":
        - columnheader "Trường/Khoa":
          - text: Trường/Khoa
          - textbox "Lọc..."
        - columnheader "Mã lớp":
          - text: Mã lớp
          - textbox "Lọc..."
        - columnheader "Mã lớp kèm":
          - text: Mã lớp kèm
          - textbox "Lọc..."
        - columnheader "Mã HP":
          - text: Mã HP
          - textbox "Lọc..."
        - columnheader "Tên HP":
          - text: Tên HP
          - textbox "Lọc..."
        - columnheader "Ghi chú":
          - text: Ghi chú
          - textbox "Lọc..."
        - columnheader "Thứ":
          - text: Thứ
          - textbox "Lọc..."
        - columnheader "Tiết BD":
          - text: Tiết BD
          - textbox "Lọc..."
        - columnheader "Tiết KT":
          - text: Tiết KT
          - textbox "Lọc..."
        - columnheader "Buổi":
          - text: Buổi
          - textbox "Lọc..."
        - columnheader "Phòng học":
          - text: Phòng học
          - textbox "Lọc..."
        - columnheader "Cần TN":
          - text: Cần TN
          - textbox "Lọc..."
        - columnheader "SLDK":
          - text: SLDK
          - textbox "Lọc..."
        - columnheader "SL Max":
          - text: SL Max
          - textbox "Lọc..."
        - columnheader "TeachingType":
          - text: TeachingType
          - textbox "Lọc..."
        - columnheader "Hành động"
    - rowgroup
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Admin Management Workflows', () => {
  4  |     test.beforeEach(async ({ page }) => {
  5  |         // Đăng ký bộ lắng nghe dialog để tự động chấp nhận alerts/confirms
  6  |         page.on('dialog', async (dialog) => {
  7  |             await dialog.accept();
  8  |         });
  9  | 
  10 |         // Đăng nhập với tư cách admin
  11 |         await page.goto('/#/login');
  12 |         await page.fill('input[placeholder="Tài khoản"]', 'admin36');
  13 |         await page.fill('input[placeholder="Mật khẩu"]', 'Admin63@');
  14 |         await page.click('button:has-text("Đăng nhập")');
  15 |         await expect(page).toHaveURL(/\/admin/);
  16 |     });
  17 | 
  18 |     test('should create a new semester and add registration period', async ({ page }) => {
  19 |         // Click "Thêm kỳ mới"
  20 |         await page.click('button:has-text("Thêm kỳ mới")');
  21 |         
  22 |         // Nhập mã học kỳ ngẫu nhiên để tránh trùng lặp
  23 |         const randSemester = `202${Math.floor(Math.random() * 900) + 100}`;
  24 |         await page.fill('input[placeholder="Nhập mã kỳ (VD: 20261)"]', randSemester);
  25 |         await page.click('.modal-overlay button:has-text("Lưu")');
  26 | 
  27 |         // Bảng giai đoạn đăng ký: Thêm đợt đăng ký mới
  28 |         await page.click('button:has-text("Thêm đợt đăng ký mới")');
  29 |         
  30 |         // Cấu hình đợt đăng ký mới: Chọn học kỳ mới tạo
  31 |         await page.locator('.registration-setup select').first().selectOption({ label: randSemester });
  32 |         
  33 |         const now = new Date();
  34 |         const startIso = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16); // yesterday
  35 |         const endIso = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16); // 5 days later
  36 | 
  37 |         // Điền thời gian bắt đầu và kết thúc
  38 |         await page.locator('.registration-setup input[type="datetime-local"]').first().fill(startIso);
  39 |         await page.locator('.registration-setup input[type="datetime-local"]').nth(1).fill(endIso);
  40 | 
  41 |         // Click "Lưu" đợt đăng ký
  42 |         await page.click('.registration-setup button:has-text("Lưu")');
  43 | 
  44 |         // Xác nhận đợt đăng ký mới hiển thị trong bảng
  45 |         const periodRow = page.locator(`tr:has-text("${randSemester}")`);
  46 |         await expect(periodRow).toBeVisible();
  47 | 
  48 |         // Xoá đợt đăng ký mới tạo để trả lại DB sạch cho các test case sau
  49 |         const deleteBtn = periodRow.locator('button:has-text("Xoá")');
  50 |         await deleteBtn.click();
  51 |         await expect(periodRow).not.toBeVisible();
  52 |     });
  53 | 
  54 |     test('should view course registration stats details', async ({ page }) => {
  55 |         // Tìm đợt đăng ký có sẵn và click "Xem chi tiết"
  56 |         const row = page.locator('tr:has-text("20253")');
  57 |         await expect(row).toBeVisible();
  58 | 
  59 |         const detailsBtn = row.locator('button:has-text("Xem chi tiết")');
  60 |         await detailsBtn.click();
  61 | 
  62 |         await expect(page).toHaveURL(/\/admin\/program-registration-details/);
  63 | 
  64 |         // Lọc theo mã học phần SSH1110
  65 |         await page.locator('input[placeholder="Lọc..."]').first().fill('SSH1110');
  66 |         await expect(page.locator('table.admin-table tbody tr')).toHaveCount(1);
  67 | 
  68 |         // Quay lại trang Dashboard
  69 |         await page.click('button:has-text("Quay lại")');
  70 |         await expect(page).toHaveURL(/\/admin/);
  71 |     });
  72 | 
  73 |     test('should edit a class course details', async ({ page }) => {
  74 |         // Tìm lớp học phần đầu tiên và click "Sửa"
  75 |         const row = page.locator('table.admin-table tbody tr').first();
> 76 |         await expect(row).toBeVisible();
     |                           ^ Error: expect(locator).toBeVisible() failed
  77 | 
  78 |         const editBtn = row.locator('button:has-text("Sửa")');
  79 |         await editBtn.click();
  80 | 
  81 |         await expect(page).toHaveURL(/\/admin\/edit/);
  82 | 
  83 |         // Thay đổi sức chứa max thành 85
  84 |         await page.locator('div:has(label:has-text("SL Max")) input').fill('85');
  85 | 
  86 |         // Lưu thay đổi
  87 |         await page.click('button:has-text("Lưu thông tin")');
  88 | 
  89 |         // Đảm bảo quay lại trang admin dashboard
  90 |         await expect(page).toHaveURL(/\/admin/);
  91 |     });
  92 | });
  93 | 
```