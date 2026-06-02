# Lớp Domain (Entities)

Đây là lớp trung tâm, chứa các quy tắc nghiệp vụ cốt lõi và **không phụ thuộc vào bất kỳ lớp nào khác**.

## Thành phần
- Các class như: `SinhVien`, `HocPhan`, `LopHoc`

## Logic
- Chứa các quy tắc bất biến  
  - Ví dụ: một học phần không thể có số tín chỉ âm


---

# Lớp Application (Use Cases)

Đây là lớp chứa các **Use Cases** của hệ thống, đóng vai trò điều phối luồng xử lý giữa lớp Domain và các lớp bên ngoài.  
Lớp này **không chứa logic nghiệp vụ cốt lõi**, mà sử dụng Entity từ Domain để thực hiện các quy trình cụ thể.

## Thành phần
- Các Use Case như:
  - `DangKyHocPhan`
  - `DangKyLopHoc`

## Nhiệm vụ
- Tiếp nhận dữ liệu đầu vào từ lớp Presentation  
  - Ví dụ: `mssv`, `maHocPhan`, `maLopHoc`

- Điều phối xử lý:
  - Gọi các Entity trong Domain để kiểm tra ràng buộc nghiệp vụ:
    - Tiên quyết
    - Số tín chỉ
    - Trùng lịch
    - Sĩ số
  - Phối hợp các bước xử lý theo đúng quy trình

- Giao tiếp dữ liệu thông qua Interface (Repository, Gateway), **không truy cập trực tiếp DB**

- Trả về kết quả:
  - Trạng thái thành công
  - Hoặc mã lỗi kèm thông báo chi tiết  
    - Ví dụ: *“Vượt quá số tín chỉ”*, *“Lớp đã đủ sĩ số”*

## Đặc điểm
- Không phụ thuộc vào framework, UI hay database
- Tuân thủ **Dependency Inversion**
- Dễ test (có thể mock Repository)


---

# Lớp Interface Adapters (Presentation + Controllers + Presenters)

Đây là lớp trung gian, có nhiệm vụ **chuyển đổi dữ liệu giữa UI/Framework và Application**.  
Giúp tách biệt hoàn toàn logic nghiệp vụ khỏi giao diện và công nghệ cụ thể.

## Thành phần

### Controllers
- Nhận request từ UI (Electron Renderer)
- Xử lý input ban đầu
- Gọi Use Case

### Presenters
- Format dữ liệu từ Use Case
- Trả về dạng phù hợp cho UI hiển thị

## Nhiệm vụ
- Nhận dữ liệu từ UI  
  - Ví dụ: `mssv`, `maHocPhan`, `maLopHoc`

- Chuyển đổi dữ liệu sang format phù hợp cho Use Case

- Gọi Use Case và nhận kết quả

- Chuyển đổi kết quả thành dữ liệu hiển thị:
  - Thông báo thành công
  - Thông báo lỗi chi tiết  
    - Ví dụ: *“Trùng lịch học”*, *“Lớp đã đủ sĩ số”*

## Công nghệ áp dụng
- Electron IPC (Main ↔ Renderer)
- TypeScript (Controllers, ViewModels)

## Đặc điểm
- Không chứa logic nghiệp vụ cốt lõi
- Không truy cập trực tiếp database
- Đóng vai trò **adapter**
- Giúp thay đổi UI (Electron → Web) mà không ảnh hưởng logic


---

# Lớp Infrastructure (Frameworks & Drivers)

Đây là lớp ngoài cùng, chứa các chi tiết cài đặt công nghệ như database, API, framework.

## Thành phần

### Repository Implementations
- Cài đặt các interface từ Application/Domain  
  - Ví dụ:
    - `DangKyRepositoryImpl`
    - `SinhVienRepositoryImpl`

### Database / Storage
- Kết nối và thao tác với DB (MySQL)

### API / External Services
- Gọi API bên ngoài (ví dụ: hệ thống SIS)

### Framework & Tools
- Electron
- Node.js
- ORM / Query Builder

## Nhiệm vụ
- Implement các Interface từ Application
- Thực hiện các thao tác kỹ thuật:
  - CRUD dữ liệu
  - Kết nối database
  - Gọi API

- Chuyển đổi dữ liệu từ storage → domain format
- Đảm bảo cung cấp dữ liệu chính xác cho Use Case

## Đặc điểm
- Phụ thuộc nhiều vào công nghệ nhất
- Có thể thay thế (MySQL → PostgreSQL)
- Phụ thuộc vào Application (implement interface)
- Không chứa logic nghiệp vụ cốt lõi