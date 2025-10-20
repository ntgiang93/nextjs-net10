using Model.Models;

namespace Model.Constants;

public enum ESysModule
{
    Auth,
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
    JobTitle
}

public static class SysModule
{
    public static readonly Dictionary<string, string> Modules = new()
    {
        { nameof(ESysModule.Users), "Users management" },
        { nameof(ESysModule.Roles), "Roles management" },
        { nameof(ESysModule.UserRole), "User's Roles management" },
        { nameof(ESysModule.Menu), "Menu management" },
        { nameof(ESysModule.UserProfile), "User Profile" },
        { nameof(ESysModule.Files), "Files management" },
        { nameof(ESysModule.SysCategories), "Static system categories management" },
        { nameof(ESysModule.BusinessCategory), "Business Category management" },
        { nameof(ESysModule.Department), "Department management" },
        { nameof(ESysModule.DepartmentType), "Department type management" },
        { nameof(ESysModule.JobTitle), "Job Title management" }
    };

    public static List<SelectOption<string>> Get2SelectOptions()
    {
        return Modules.Select(x => new SelectOption<string>
        {
            Value = x.Key,
            Label = x.Value
        }).ToList();
    }
}