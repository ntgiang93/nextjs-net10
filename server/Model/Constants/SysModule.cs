using Model.Models;

namespace Model.Constants;

public enum ESysModule
{
    Users,
    Roles,
    UserRole,
    Menu,
    UserProfile,
    Files,
    SysCategories,
    BusinessCategory,
    Department,
    DepartmentType,
    JobTitle,
    JobScheduler
}

public static class SysModule
{
    public static readonly Dictionary<string, MessageList.Translations> Modules = new()
    {
        { nameof(ESysModule.Users), new MessageList.Translations("Users management", "Quản lý người dùng") },
        { nameof(ESysModule.Roles), new MessageList.Translations("Roles management", "Quản lý vai trò") },
        { nameof(ESysModule.UserRole), new MessageList.Translations("User's Roles management", "Quản lý vai trò của người dùng") },
        { nameof(ESysModule.Menu), new MessageList.Translations("Menu management", "Quản lý menu") },
        { nameof(ESysModule.UserProfile), new MessageList.Translations("User Profile", "Hồ sơ người dùng") },
        { nameof(ESysModule.Files), new MessageList.Translations("Files management", "Quản lý tập tin") },
        { nameof(ESysModule.SysCategories), new MessageList.Translations("Static system categories management", "Quản lý danh mục hệ thống") },
        { nameof(ESysModule.BusinessCategory), new MessageList.Translations("Business Category management", "Quản lý danh mục nghiệp vụ") },
        { nameof(ESysModule.Department), new MessageList.Translations("Department management", "Quản lý phòng ban") },
        { nameof(ESysModule.DepartmentType), new MessageList.Translations("Department type management", "Quản lý loại phòng ban") },
        { nameof(ESysModule.JobTitle), new MessageList.Translations("Job Title management", "Quản lý chức danh") },
        { nameof(ESysModule.JobScheduler), new MessageList.Translations("Job Scheduler management", "Quản lý lập lịch công việc") }
    };

    public static List<SelectOption<string>> Get2SelectOptions(string languageCode)
    {
        return Modules.Select(x => new SelectOption<string>
        {
            Value = x.Key,
            Label = languageCode switch
            {
                "en" => x.Value.English,
                "vi" => x.Value.Vietnamese,
                _ => x.Value.Vietnamese
        }
        }).ToList();
    }
}