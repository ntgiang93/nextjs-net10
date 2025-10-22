using Model.Models;
using System.Text.Json.Serialization;

namespace Model.DTOs.System.User;

/// <summary>
///     Represents a user entry for display in a table view.
/// </summary>
public class UserTableDto
{
    public string Id { get; set; }
    public string UserName { get; set; }
    public string Avatar { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public string FullName { get; set; }
    public bool IsActive { get; set; }
    public bool isLocked { get; set; }
    public List<string> Roles { get; set; }
    [JsonIgnore]
    public string RolesString { get; set; }
}

public class UserSelectDto
{
    public string Id { get; set; }
    public string UserName { get; set; }
    public string Avatar { get; set; }
    public string Email { get; set; }
    public string FullName { get; set; }
    [JsonIgnore]
    public DateTime CreatedAt { get; set; }
}

public class UserTableRequestDto : PaginationRequest
{
    public bool? IsActive { get; set; }
    public bool? isLocked { get; set; }
}