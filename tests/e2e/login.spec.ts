import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
    test.beforeEach(async ({ page }) => {
        // Đi tới trang đăng nhập
        await page.goto('/login');
    });

    test('should login successfully as student', async ({ page }) => {
        // Nhập thông tin sinh viên
        await page.fill('input[placeholder="Tài khoản"]', 'student36');
        await page.fill('input[placeholder="Mật khẩu"]', 'Student36@');

        // Click nút đăng nhập
        await page.click('button:has-text("Đăng nhập")');

        // Xác nhận chuyển hướng đến trang student dashboard
        await expect(page).toHaveURL(/\/student/);
        await expect(page.locator('.nav-title')).toHaveText('Đăng ký học tập');
        await expect(page.locator('.page-kicker')).toHaveText('Hệ thống đăng ký học tập');

        // Đăng xuất
        await page.click('.profile-trigger');
        await page.click('button:has-text("Đăng xuất")');

        // Quay lại màn hình đăng nhập
        await expect(page).toHaveURL(/\/login/);
    });

    test('should login successfully as admin', async ({ page }) => {
        // Nhập thông tin admin
        await page.fill('input[placeholder="Tài khoản"]', 'admin36');
        await page.fill('input[placeholder="Mật khẩu"]', 'Admin63@');

        // Click đăng nhập
        await page.click('button:has-text("Đăng nhập")');

        // Xác nhận chuyển hướng đến trang admin dashboard
        await expect(page).toHaveURL(/\/admin/);
        await expect(page.locator('.nav-title')).toHaveText('Quản trị hệ thống');

        // Đăng xuất
        await page.click('.profile-trigger');
        await page.click('button:has-text("Đăng xuất")');

        // Quay lại màn hình đăng nhập
        await expect(page).toHaveURL(/\/login/);
    });

    test('should show notification alert on invalid credentials', async ({ page }) => {
        // Nhập sai tài khoản/mật khẩu
        await page.fill('input[placeholder="Tài khoản"]', 'wronguser');
        await page.fill('input[placeholder="Mật khẩu"]', 'wrongpass');

        // Click đăng nhập
        await page.click('button:has-text("Đăng nhập")');

        // Kiểm tra xem có thông báo lỗi hiển thị trên màn hình
        const notification = page.locator('.login-notification');
        await expect(notification).toBeVisible();
        await expect(notification).toContainText('Sai tài khoản hoặc mật khẩu.');
    });
});
