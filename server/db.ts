import sqlite3 from 'sqlite3';
import path from 'path';

const isTest = process.env.NODE_ENV === 'test';
let dbPath = ':memory:';

if (!isTest) {
    if (process.versions && process.versions.electron) {
        // Chạy trong Electron (production/dev)
        const { app } = require('electron');
        const fs = require('fs');
        
        // Kiểm tra xem đã build ra file cài đặt hay chưa
        if (app.isPackaged) {
            const userDataPath = app.getPath('userData');
            dbPath = path.join(userDataPath, 'database.sqlite');
            
            // Nếu file DB chưa có trong userData, copy từ resource đã đóng gói
            if (!fs.existsSync(dbPath)) {
                const originalPath = path.join(process.resourcesPath, 'database.sqlite');
                if (fs.existsSync(originalPath)) {
                    fs.copyFileSync(originalPath, dbPath);
                }
            }
        } else {
            // Môi trường Dev (npm run dev): Dùng trực tiếp file trong source code
            dbPath = path.join(__dirname, '../../src/infrastructure/database/database.sqlite');
        }
    } else {
        // Chạy bình thường qua NodeJS (tsx)
        dbPath = path.join(__dirname, '../src/infrastructure/database/database.sqlite');
    }
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Lỗi kết nối cơ sở dữ liệu:', err.message);
    }
});

export default db;
