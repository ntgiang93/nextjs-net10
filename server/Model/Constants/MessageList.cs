// 1. Định nghĩa Enum với các giá trị là tên của message

namespace Model.Constants;

public static class MessageList
{
    // 2. Dictionary tĩnh sử dụng Enum làm key
    public static readonly Dictionary<EMessage, Translations> MessageDictionary;

    // Khởi tạo Dictionary trong static constructor
    static MessageList()
    {
        MessageDictionary = new Dictionary<EMessage, Translations>
        {
            {
                EMessage.AuthenticationFailed,
                new Translations("Authentication failed. Incorrect username or password.",
                    "Đăng nhập thất bại. Tên đăng nhập hoặc mật khẩu không đúng.")
            },
            {
                EMessage.CannotModifyProtectedRole,
                new Translations(
                    "Protected roles cannot be modified or delete. These are system roles required for core functionality.",
                    "Không thể chỉnh sửa hoặc xóa vai trò được bảo vệ. Đây là các vai trò hệ thống cần thiết cho chức năng cốt lõi.")
            },
            {
                EMessage.ChangeEmailSubject,
                new Translations("Action Required: Confirm Your New Email", "Yêu cầu xác nhận thay đổi địa chỉ Email.")
            },
            {
                EMessage.CodeIsInUse,
                new Translations("This code is already in use. Please enter a different one.",
                    "Mã này đã được sử dụng. Vui lòng nhập mã khác.")
            },
            { EMessage.EmailExisted, new Translations("Email already exists.", "Email này đã tồn tại.") },
            {
                EMessage.Error400Msg,
                new Translations("Invalid request. Please check the request payload and try again.",
                    "Dữ liệu yêu cầu (body) không hợp lệ. Vui lòng kiểm tra payload và thử lại.")
            },
            {
                EMessage.Error403Msg,
                new Translations("You do not have permission to access this resource.",
                    "Bạn không có quyền truy cập tài nguyên này.")
            },
            {
                EMessage.Error404Msg,
                new Translations("The requested resource was not found or may have been removed.",
                    "Tài nguyên bạn yêu cầu không tồn tại hoặc đã bị xóa.")
            },
            {
                EMessage.Error409Msg,
                new Translations("Data already exists or a conflict occurred.",
                    "Dữ liệu đã tồn tại hoặc đã xảy ra xung đột.")
            },
            {
                EMessage.Error415Msg,
                new Translations("The media type is not supported.", "Loại dữ liệu không được hỗ trợ.")
            },
            {
                EMessage.Error422Msg,
                new Translations("The data is invalid. Please check and try again.",
                    "Dữ liệu không hợp lệ. Vui lòng kiểm tra và thử lại.")
            },
            {
                EMessage.Error429Msg,
                new Translations("Too many requests. Please try again later.",
                    "Quá nhiều yêu cầu. Vui lòng thử lại sau.")
            },
            {
                EMessage.Error500Msg,
                new Translations("An unexpected error occurred on the server. Please try again later.",
                    "Đã xảy ra lỗi không mong muốn trên máy chủ. Vui lòng thử lại sau.")
            },
            { EMessage.FailureMsg, new Translations("Operation failed.", "Thao tác thất bại.") },
            { EMessage.IncorrectPassword, new Translations("Incorrect password.", "Mật khẩu không đúng.") },
            {
                EMessage.MenuLinkAlreadyExists,
                new Translations("Menu or link already exists.", "Đường dẫn menu đã tồn tại.")
            },
            {
                EMessage.PhoneExisted,
                new Translations("Phone number already exists.", "Số điện thoại này đã tồn tại.")
            },
            {
                EMessage.RoleAlreadyExists,
                new Translations("Role already exists. Please use a different name.",
                    "Vai trò đã tồn tại. Vui lòng sử dụng tên khác.")
            },
            {
                EMessage.RoleNotFound,
                new Translations("Role was not found or may have been removed.",
                    "Không tìm thấy vai trò hoặc vai trò đã bị xóa.")
            },
            { EMessage.SuccessMsg, new Translations("Operation successful.", "Thao tác thành công.") },
            { EMessage.TokenInvalid, new Translations("Invalid token.", "Token không chính xác.") },
            {
                EMessage.UserNameExisted,
                new Translations("UserName already exists.", "Tên tài khoản này đã tồn tại.")
            },
            {
                EMessage.UserNotFound,
                new Translations("User was not found or may have been removed.",
                    "Không tìm thấy người dùng hoặc đã bị xóa.")
            },
            {
                EMessage.WarningChangeEmailSubject,
                new Translations("Security Alert: Your Email Address Was Updated.",
                    "Cảnh báo bảo mật: Địa chỉ Email của bạn đã được cập nhật.")
            },
            {
                EMessage.DeviceIsRequired,
                new Translations("Device is required.",
                    "Thông tin thiết bị là bắt buộc.")
            },
            {
                EMessage.FileTypeNotAllowed,
                new Translations("File type is not allowed.",
                    "Loại tệp không được phép.")
            },
            {
                EMessage.LimitFileSize,
                new Translations("File size exceeds the limit.",
                    "Kích thước tệp vượt quá giới hạn.")
            },
            {
                EMessage.FileRequired,
                new Translations("File is required.",
                    "Tệp là bắt buộc.")
            },
            {
                EMessage.FileDeleteError,
                new Translations("An error occurred while deleting the file.",
                    "Đã xảy ra lỗi trong quá trình xóa tệp.")
            },
            {
                EMessage.CodeIsExist,
                new Translations("This code already exists. Please use a different one.",
                    "Mã này đã tồn tại. Vui lòng sử dụng mã khác.")
            },
            {
                EMessage.VerifyEmailSubject,
                new Translations("Verify Your Email Address",
                    "Xác minh địa chỉ email của bạn")
            },
            {
                EMessage.NotPermissionModifyRole,
                new Translations("You do not have permission to modify this roles.",
                    "Bạn không có quyền thay đổi vai trò này.")
            },
            {
                EMessage.LanguageNotSupported,
                new Translations("The specified language is not supported.",
                    "Ngôn ngữ được chỉ định không được hỗ trợ.")
            }
        };
    }

    // 3. Class để chứa các bản dịch
    public class Translations
    {
        public Translations(string english, string vietnamese)
        {
            English = english;
            Vietnamese = vietnamese;
        }

        public string English { get; }
        public string Vietnamese { get; }
    }
}