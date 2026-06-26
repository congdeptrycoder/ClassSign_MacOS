import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**', 'out/**'],
    globals: true,
    environmentMatchGlobs: [
      ['tests/integration/server/**/*.ts', 'node'],
      ['tests/server/**/*.ts', 'node'],
      ['tests/src/**/*.test.ts', 'jsdom'],
      ['tests/integration/src/**/*.test.ts', 'jsdom'],
    ],
    // Cấu hình mặc định nếu không khớp
    environment: 'node',
    alias: {
      '@renderer': path.resolve(__dirname, './src')
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts', 'server/**/*.ts'],
      exclude: [
        'src/domain/repositories/**',
        'src/di/**',
        'src/shared/config/**',
        'src/shared/types/**',
        'src/infrastructure/electron/**',
        'src/application/dto/**',
        'src/domain/entities/StudentRegistration.ts',
        'server/index.ts',
        'tests/**',
        '**/node_modules/**',
      ],
    },
  },
});
