using Model.Models;

namespace Model.Constants;

public enum EPermission
{
    Development,
    Deletion,
    Edition,
    Approved,
    Creation,
    View
}

public static class Permission
{
    public static readonly string PermissionCacheKeyPrefix = "RolePermissions_";

    public static readonly Dictionary<string, string> Permissions = new()
    {
        { nameof(EPermission.Development), "Development" },
        { nameof(EPermission.Deletion), "Deletion" },
        { nameof(EPermission.Edition), "Edition" },
        { nameof(EPermission.Approved), "Approved" },
        { nameof(EPermission.Creation), "Creation" },
        { nameof(EPermission.View), "View" }
    };
    
    public static List<SelectOption<string>> Get2SelectOptions()
    {
        return Permissions.Where((p) => p.Key != nameof(EPermission.Development)).Select(x => new SelectOption<string>
        {
            Value = x.Key,
            Label = x.Value
        }).ToList();
    }
}