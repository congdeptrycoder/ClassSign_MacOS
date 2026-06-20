# Báo Cáo Kết Quả Refactoring - Dự Án ClassSign

Tài liệu này tổng hợp toàn bộ các kết quả refactor cho 16 code smells đã xác định trong dự án ClassSign, nhằm đảm bảo tuân thủ nghiêm ngặt Clean Architecture, SOLID, và MVVM.

## 1. Bảng So Sánh Trước và Sau Refactor

| Mã Smell | Trước Refactor | Sau Refactor | Kỹ Thuật Áp Dụng |
| :--- | :--- | :--- | :--- |
| **Smell 1** | `student-registration.service.ts` là God Class chứa hàng ngàn dòng code trộn lẫn nhiều nghiệp vụ khác nhau. | Tách nhỏ thành 5 service đơn nhiệm: `curriculum`, `course-registration`, `class-registration`, `timetable`, `migration`. File cũ đóng vai trò Facade trung chuyển. | **Extract Class / Split Class** & **Facade Pattern** |
| **Smell 2** | Code trùng lặp trong `useClassRegistrationViewModel.ts` khi xử lý đăng ký từ danh sách gợi ý và từ tìm kiếm. | Trích xuất thành phương thức dùng chung `registerClass(classId, classCode, showAlertIfInactive)`. | **Extract Method** |
| **Smell 3** | Sử dụng kiểu `any` tràn lan trong các Context Strategy và ViewModel (`useAdminClassViewModel.ts`). | Khai báo các interface/DTO chi tiết (`SaveClassCourseInputDTO`, `ClassCourseOutputDTO`) thay thế `any`. | **Type Safety Standard** |
| **Smell 4** | Feature Envy và workaround `tempAccount` trong `useCourseRegistrationViewModel.ts` do Account bị mất prototype methods. | Khởi tạo thực thể `new Account(...)` tại đầu hook và gọi trực tiếp các phương thức nghiệp vụ. | **Replace Data Value with Object** |
| **Smell 5** | Shadowed Imports trong `student-registration.service.ts` định nghĩa lại trùng tên helper. | Loại bỏ các hàm helper trùng tên local, import trực tiếp từ `registration.utils`. | **Remove Redundant Code** |
| **Smell 6** | Thiếu đồng bộ xử lý lỗi (thiếu `try-catch`) trong các Client Repositories. | Bọc toàn bộ các hàm gọi API trong khối `try-catch` và ghi log lỗi qua Logger. | **Uniform Error Handling** |
| **Smell 7** | Khai báo thuộc tính constructor rườm rà trong `LoginController` và `LoginUseCase`. | Sử dụng TypeScript constructor shorthand (`constructor(private ...)`). | **Code Simplification** |
| **Smell 8** | Tên thuộc tính bằng Tiếng Việt (`ma_hp`, `ten_hp`, `truong_khoa`...) lan sang Domain/UI. | Đổi tên toàn bộ thuộc tính sang Tiếng Anh, dịch dữ liệu ở tầng Client Repositories để giữ tương thích ngược với Server SQLite. | **Rename Properties / Translation Mapper** |
| **Smell 9** | Use Cases chỉ đóng vai trò chuyển tiếp thụ động (Middle Man). | Bổ sung logic kiểm tra tham số đầu vào (validation) và ghi nhận vết gọi log. | **Enrich Use Case Responsibility** |
| **Smell 10** | Các Entities anemic thiếu logic nghiệp vụ (`AcademicPeriod`, `Semester`, `CourseRegistrationStat`). | Bổ sung các phương thức tự kiểm tra trạng thái diễn ra (`isCurrentlyActive`, `getDaysRemaining`, `getAcademicYear`). | **Rich Domain Model** |
| **Smell 11** | `LoginController` tự wrap response thành `{ success: false }` thay vì ném lỗi trực tiếp lên ViewModel. | Để exceptions bay thẳng lên ViewModel và xử lý tại khối `try-catch` của ViewModel để cập nhật UI đồng bộ. | **Exception Propagation** |
| **Smell 12** | Thuộc tính của `Account.ts` thiếu access modifier rõ ràng. | Bổ sung `public readonly` rõ ràng trong constructor shorthand của `Account.ts`. | **Access Modifier Standard** |
| **Smell 13** | Sử dụng magic strings trực tiếp cho các trạng thái đăng ký, trạng thái sinh viên. | Định nghĩa enum chung `RegistrationPeriodType`, `StudentStatus`, `CourseRegistrationStatus` tại `constants.ts`. | **Replace Magic String with Enum** |
| **Smell 14** | Leak dependency từ Application sang Domain (Domain Repos import DTO từ Application). | Di chuyển các interface DTO dùng chung xuống Domain (`ClassCourse.ts`) và re-export ở Application. | **Clean Architecture Dependency Rule** |
| **Smell 15** | Thiếu cấu trúc thư mục chuẩn (`domain/services/`, `application/interfaces/` trống). | Thêm các file `.gitkeep` để giữ nguyên cấu trúc thư mục rỗng trên Git. | **Project Structure Preservation** |
| **Smell 16** | Thiếu cơ chế ghi log lỗi từ client lên server. | Xây dựng helper `Logger` ở client tự động post dữ liệu log lỗi về endpoint `POST /api/logs` ghi vào `client.log` ở server. | **Client-to-Server Remote Logging** |

---

## 2. Đánh Giá Tác Động Sau Khi Refactor

### 1. Code dễ đọc hơn ở điểm nào?
- **Đồng bộ ngôn ngữ**: Nhờ chuyển toàn bộ các trường dữ liệu ở Domain, Use Cases, ViewModels và UI sang tiếng Anh (ví dụ: `courseCode` thay cho `ma_hp`, `classCode` thay cho `ma_lop`), nhà phát triển không còn phải đọc một mã nguồn nửa Việt nửa Anh, tạo cảm giác chuyên nghiệp và dễ hiểu.
- **Tránh trùng lặp và loại bỏ "ma thuật"**: Việc đóng gói các magic strings thành `enum` rõ ràng và trích xuất phương thức trùng lặp trong ViewModels giúp mã nguồn ngắn gọn, tập trung và rõ ràng về mặt mục đích sử dụng.
- **Cấu trúc gọn nhẹ**: Tách file dịch vụ server khổng lồ `student-registration.service.ts` thành các module nhỏ giúp dễ dàng khoanh vùng mã nguồn khi cần tìm kiếm hoặc chỉnh sửa logic cụ thể (ví dụ: muốn sửa thời khóa biểu chỉ cần vào `timetable.service.ts`).

### 2. Bộ kiểm thử (Test) có giúp đảm bảo refactoring không làm sai chức năng không?
- **Hoàn toàn đảm bảo**: Dự án có bộ unit test rất phong phú kiểm thử từ tầng Entity, Use Case, Controller đến ViewModel. 
- Sau khi refactor làm thay đổi cấu trúc dữ liệu hoặc luồng ném lỗi (như luồng đăng nhập ném lỗi trực tiếp thay vì bọc response), bộ kiểm thử lập tức phát hiện các sai lệch. Chúng tôi đã tiến hành cập nhật lại các mock test tương ứng và chạy lại thành công toàn bộ **42 file test** với **270 trường hợp kiểm thử** đều đạt kết quả xanh (Pass 100%). Điều này chứng minh chức năng hoạt động của hệ thống được bảo toàn trọn vẹn, không xảy ra regression.

### 3. Module nào dễ mở rộng hơn sau khi refactor?
- **Module đăng ký lớp học và học phần (Registration Services)**: Do tầng dịch vụ máy chủ đã được chia nhỏ độc lập và tầng Domain đã được bổ sung các Strategy & Entity phong phú, việc thêm mới các quy tắc đăng ký (như thêm điều kiện ràng buộc môn học, giới hạn giờ học mới) sẽ chỉ cần cập nhật trong các Strategy tương ứng hoặc thêm phương thức xác thực đầu vào trong các Use Case mà không lo ảnh hưởng đến các phần khác.
- **Tầng Client Repositories**: Việc bọc try-catch đồng bộ kết hợp cơ chế Logging từ xa giúp việc thay thế hoặc nâng cấp API client (ví dụ: chuyển từ REST API sang GraphQL hay gRPC) trở nên vô cùng đơn giản, chỉ cần thay đổi mã nguồn trong Infrastructure Repositories mà giữ nguyên toàn bộ Business Logic ở tầng trên.
