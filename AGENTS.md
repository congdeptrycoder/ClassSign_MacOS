## BỐI CẢNH DỰ ÁN 
- Dự án của tôi là 1 phần mềm đăng ký học tập. Hệ thống có 2 giai đoạn cho student đăng ký: Đăng ký học phần và đăng ký học tập. Đăng ký học phần thì sẽ chỉ cho phép đăng ký những học phần mà chương trình đào tạo của học sinh đó đang học có. Đăng ký lớp học thì sẽ làm 2 giai đoạn nhỏ: Giai đoạn 1 chỉ cho đăng ký lớp học của những học phần đã đăng ký trước, giai đoạn 2 cho đăng ký lớp học của tất cả các học phần nếu còn chỗ. Admin có quyền tạo các giai đoạn, CRUD danh sách lớp học, theo dõi sinh viên đăng ký học phần, đăng ký lớp học
- Tech Stack: Electron, React, TypeScript, SQLite (Database)
- Thiết kế theo Clean Architecture (đọc file clean_architecture.md) và Model-View-ViewModel
- Sử dụng đủ 5 tiêu chí SOLID và 3 design pattern: Strategy, Observer, Repository ( Khi phát hiện có code lỗi design pattern hoặc SOLID thì sửa ngay và báo cáo lại )
- Cấu trúc thư mục src: 
src/
├── domain/ 
│   # LAYER 1 - CORE (KHÔNG PHỤ THUỘC AI)
│   # Chỉ chứa business logic cốt lõi và quy tắc nghiệp vụ
│
│   ├── entities/
│   │   # Các đối tượng nghiệp vụ (Enterprise Business Rules)
│   │   # KHÔNG chứa logic về UI, DB, API
│   │   # Ví dụ: SinhVien, HocPhan, LopHoc
│
│   ├── repositories/
│   │   # Interface (Port) định nghĩa cách truy xuất dữ liệu
│   │   # KHÔNG có code implement
│   │   # Ví dụ: ISinhVienRepository, IHocPhanRepository
│
│   └── services/ (optional)
│       # Domain Service (nếu có logic nghiệp vụ phức tạp liên quan nhiều entity)
│       # Ví dụ: KiemTraDangKyService
│


├── application/
│   # LAYER 2 - USE CASES
│   # Chứa các kịch bản nghiệp vụ (Application Business Rules)
│   # KHÔNG phụ thuộc framework, UI, DB
│
│   ├── use-cases/
│   │   # Mỗi file = 1 Use Case (1 hành động của user)
│   │   # Ví dụ: DangKyHocPhan.ts, DangKyLopHoc.ts
│   │
│   │   # Nhiệm vụ:
│   │   # - Nhận input từ Controller
│   │   # - Gọi Entity (domain)
│   │   # - Gọi Repository Interface
│   │   # - Trả về output (DTO)
│
│   ├── dto/
│   │   # Định nghĩa Input/Output cho Use Case
│   │   # Ví dụ:
│   │   # - DangKyHocPhanInputDTO
│   │   # - DangKyHocPhanOutputDTO
│
│   └── interfaces/
│       # Interface cho các service bên ngoài (Gateway)
│       # Ví dụ:
│       # - INotificationService
│       # - IAuthService
│
├── interface-adapters/
│   # LAYER 3 - INTERFACE ADAPTERS
│   # Chuyển đổi dữ liệu giữa UI ↔ Application ↔ Domain
│
│   ├── controllers/
│   │   # Nhận request từ UI (Electron IPC / HTTP)
│   │   # Gọi Use Case
│   │   # Ví dụ: DangKyController
│
│   ├── presenters/
│   │   # Format output từ Use Case → UI
│   │   # Ví dụ: DangKyPresenter (trả về message, status)
│
│   ├── mappers/
│   │   # Chuyển đổi dữ liệu giữa:
│   │   # DTO ↔ Entity
│   │   # API Model ↔ Domain
│
│   └── viewmodels/
│       # MVVM nằm ở đây
│       # ViewModel:
│       # - Gọi Controller
│       # - Xử lý state cho UI
│       # - KHÔNG chứa business logic
│
├── presentation/
│   # UI LAYER (VIEW ONLY)
│   # Chỉ chứa giao diện (React/Electron)
│
│   ├── screens/
│   │   └── Home/
│   │       ├── HomeScreen.tsx
│   │       # Chỉ hiển thị UI
│       # KHÔNG chứa logic nghiệp vụ
│
│   ├── components/
│   │   # UI components tái sử dụng
│
│   └── navigation/
│       # Điều hướng màn hình
│
├── infrastructure/
│   # LAYER 4 - OUTER (FRAMEWORK & TOOLS)
│   # Chứa toàn bộ code phụ thuộc công nghệ
│
│   ├── api/
│   │   # Gọi API bên ngoài (Axios, Fetch)
│
│   ├── database/
│   │   # Kết nối DB (MySQL)
│   │   # Config connection
│
│   ├── repositories/
│   │   # IMPLEMENT Repository interface từ domain
│   │   # Ví dụ: SinhVienRepositoryImpl
│
│   ├── storage/
│   │   # Local storage / cache
│
│   └── services/
│       # Implement các interface ở application/interfaces
│       # Ví dụ: NotificationServiceImpl
│
├── di/
│   # DEPENDENCY INJECTION
│   # Nơi khởi tạo và inject dependencies
│   # Kết nối:
│   # Controller → UseCase → RepositoryImpl
│
│   # Có thể dùng:
│   # - Inversify
│   # - hoặc manual DI
│
├── shared/
│   # DÙNG CHUNG
│   ├── constants/
│   ├── utils/
│   └── types/
│
└── App.tsx
    # Entry point ứng dụng
## IMPORTANT
- Tên biến đặt theo nghĩa Tiếng Anh của mục đích biến ( ngăn cách các từ bằng dấu -, ví dụ thanh điều hướng trên cùng sẽ là navbar-head)
- Luôn bọc các hàm API trong try-catch
- Luôn ghi log vào các file log trong thư mục logs
- Mọi tính năng đều đi kèm unit test tương ứng 
- Ưu tiên không dùng thư viện thứ 3, nếu cần phải hỏi và giải thích nếu muốn sử dụng thư viện thứ 3
