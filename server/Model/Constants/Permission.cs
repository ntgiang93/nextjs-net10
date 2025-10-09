using Model.Models;

namespace Model.Constants;

[Flags]
public enum EPermission
{
    None = 0,
    View = 1 << 0, // 000001  = 1
    Create = 1 << 1, // 000010  = 2
    Edit = 1 << 2, // 000100  = 4
    Delete = 1 << 3, // 001000  = 8
    Approve = 1 << 4,// 010000  = 16
    Export = 1 << 5 // 100000  = 32
}


public static class Permission
{
    public static readonly string PermissionCacheKeyPrefix = "RolePermission_";

    public static readonly Dictionary<EPermission, string> Permissions = new()
    {
        { EPermission.View, "View" },
        { EPermission.Create, "Create" },
        { EPermission.Edit, "Edit" },
        { EPermission.Delete, "Delete" },
        { EPermission.Approve, "Approve" },
        { EPermission.Export, "Export" },
    };
    
    public static List<SelectOption<EPermission>> Get2SelectOptions()
    {
        return Permissions.Select(x => new SelectOption<EPermission>
        {
            Value = x.Key,
            Label = x.Value
        }).ToList();
    }
}