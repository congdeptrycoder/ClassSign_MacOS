import { test, expect } from '@playwright/test';

test.describe('Admin Management Workflows', () => {
    test.beforeEach(async ({ page }) => {
        // Đăng ký bộ lắng nghe dialog để tự động chấp nhận alerts/confirms
        page.on('dialog', async (dialog) => {
            await dialog.accept();
        });

        // Đăng nhập với tư cách admin
        await page.goto('/#/login');
        await page.fill('input[placeholder="Tài khoản"]', 'admin36');
        await page.fill('input[placeholder="Mật khẩu"]', 'Admin63@');
        await page.click('button:has-text("Đăng nhập")');
        await expect(page).toHaveURL(/\/admin/);
    });

    test('should create a new semester and add registration period', async ({ page }) => {
        // Click "Thêm kỳ mới"
        await page.click('button:has-text("Thêm kỳ mới")');
        
        // Nhập mã học kỳ ngẫu nhiên để tránh trùng lặp
        const randSemester = `202${Math.floor(Math.random() * 900) + 100}`;
        await page.fill('input[placeholder="Nhập mã kỳ (VD: 20261)"]', randSemester);
        await page.click('.modal-overlay button:has-text("Lưu")');

        // Bảng giai đoạn đăng ký: Thêm đợt đăng ký mới
        await page.click('button:has-text("Thêm đợt đăng ký mới")');
        
        // Cấu hình đợt đăng ký mới: Chọn học kỳ mới tạo
        await page.locator('.registration-setup select').first().selectOption({ label: randSemester });
        
        const now = new Date();
        const startIso = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16); // yesterday
        const endIso = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16); // 5 days later

        // Điền thời gian bắt đầu và kết thúc
        await page.locator('.registration-setup input[type="datetime-local"]').first().fill(startIso);
        await page.locator('.registration-setup input[type="datetime-local"]').nth(1).fill(endIso);

        // Click "Lưu" đợt đăng ký
        await page.click('.registration-setup button:has-text("Lưu")');

        // Xác nhận đợt đăng ký mới hiển thị trong bảng
        const periodRow = page.locator(`tr:has-text("${randSemester}")`);
        await expect(periodRow).toBeVisible();

        // Xoá đợt đăng ký mới tạo để trả lại DB sạch cho các test case sau
        const deleteBtn = periodRow.locator('button:has-text("Xoá")');
        await deleteBtn.click();
        await expect(periodRow).not.toBeVisible();
    });

    test('should view course registration stats details', async ({ page }) => {
        // Tìm đợt đăng ký có sẵn và click "Xem chi tiết"
        const row = page.locator('tr:has-text("20253")');
        await expect(row).toBeVisible();

        const detailsBtn = row.locator('button:has-text("Xem chi tiết")');
        await detailsBtn.click();

        await expect(page).toHaveURL(/\/admin\/program-registration-details/);

        // Lọc theo mã học phần SSH1110
        await page.locator('input[placeholder="Lọc..."]').first().fill('SSH1110');
        await expect(page.locator('table.admin-table tbody tr')).toHaveCount(1);

        // Quay lại trang Dashboard
        await page.click('button:has-text("Quay lại")');
        await expect(page).toHaveURL(/\/admin/);
    });

    test('should edit a class course details', async ({ page }) => {
        // Tìm lớp học phần đầu tiên và click "Sửa"
        const row = page.locator('table.admin-table tbody tr').first();
        await expect(row).toBeVisible();

        const editBtn = row.locator('button:has-text("Sửa")');
        await editBtn.click();

        await expect(page).toHaveURL(/\/admin\/edit/);

        // Thay đổi sức chứa max thành 85
        await page.locator('div:has(label:has-text("SL Max")) input').fill('85');

        // Lưu thay đổi
        await page.click('button:has-text("Lưu thông tin")');

        // Đảm bảo quay lại trang admin dashboard
        await expect(page).toHaveURL(/\/admin/);
    });
});
