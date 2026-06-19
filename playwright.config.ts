import { defineConfig, devices } from '@playwright/test';
import { execSync } from 'child_process';

// Phục hồi database sqlite về trạng thái ban đầu của git trước khi chạy tests
try {
  execSync('git restore src/infrastructure/database/database.sqlite');
} catch (e) {
  console.warn('Không thể restore database bằng git:', e);
}

export default defineConfig({
  testDir: './tests/e2e',
  // Chạy tuần tự và giới hạn 1 worker để tránh lỗi khóa (lock) SQLite DB dùng chung
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'NODE_ENV=development npm run server',
      url: 'http://127.0.0.1:3002/api/semesters',
      reuseExistingServer: true,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: 'npx vite',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: true,
      stdout: 'pipe',
      stderr: 'pipe',
    }
  ],
});
