import { test, expect } from '@playwright/test';

test.describe('Student Registration Workflows', () => {
    test.beforeEach(async ({ page }) => {
        // Đăng nhập với tư cách sinh viên
        await page.goto('/#/login');
        await page.fill('input[placeholder="Tài khoản"]', 'student36');
        await page.fill('input[placeholder="Mật khẩu"]', 'Student36@');
        await page.click('button:has-text("Đăng nhập")');
        await expect(page).toHaveURL(/\/student/);
    });

    test('should view curriculum and navigate back', async ({ page }) => {
        // Click nút "Xem CTĐT"
        await page.click('button:has-text("Xem CTĐT")');
        await expect(page).toHaveURL(/\/student\/curriculum/);

        // Đảm bảo bảng chương trình đào tạo hiển thị
        await expect(page.locator('.page-kicker')).toHaveText('Chương trình đào tạo');
        await expect(page.locator('table.info-table')).toBeVisible();

        // Quay lại trang Dashboard
        await page.click('button:has-text("Quay lại")');
        await expect(page).toHaveURL(/\/student/);
    });

    test('should view timetable and register/cancel class section', async ({ page }) => {
        // Đợt đăng ký lớp đang mở cho học kỳ 20253
        await expect(page.locator('h1')).toContainText('Đợt đăng ký lớp học');
        await expect(page.locator('.timetable-section')).toBeVisible();

        // Tìm học phần AC2020 trong danh sách đăng ký
        const row = page.locator('tr:has-text("AC2020")');
        await expect(row).toBeVisible();

        // Click nút expand "▶" để mở danh sách lớp học phần
        const expandBtn = row.locator('.expand-btn');
        await expandBtn.click();

        // Đợi bảng danh sách lớp con hiện ra
        const subTable = page.locator('table.sub-table');
        await expect(subTable).toBeVisible();

        // Tìm lớp "148020" và bấm "Đăng ký"
        const classRow = subTable.locator('tr:has-text("148020")');
        const registerBtn = classRow.locator('button:has-text("Đăng ký")');
        await registerBtn.click();

        // Xác nhận đăng ký lớp học thành công
        // Nút bấm sẽ đổi sang "Huỷ lớp"
        const cancelBtn = classRow.locator('button:has-text("Huỷ lớp")');
        await expect(cancelBtn).toBeVisible();

        // Kiểm tra xem thời khóa biểu tạm thời có cập nhật lớp học đó
        const timetableGrid = page.locator('.time-grid');
        await expect(timetableGrid.locator('text=AC2020')).toBeVisible();

        // Huỷ lớp đã đăng ký
        await cancelBtn.click();

        // Nút bấm chuyển lại thành "Đăng ký"
        await expect(registerBtn).toBeVisible();
    });
});
