using Model.Models;

namespace Model.DTOs.System.User;

/// <summary>
///     Represents a user entry for display in a table view.
/// </summary>
public class UserTableDto
{
    public string Id { get; set; }
    public string Username { get; set; }
    public string Avatar { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public string FullName { get; set; }
    public bool IsActive { get; set; }
    public bool isLocked { get; set; }
    public List<string> Roles { get; set; }
}

public class UserSelectDto
{
    public string Id { get; set; }
    public string Username { get; set; }
    public string Avatar { get; set; }
    public string Email { get; set; }
    public string FullName { get; set; }
}

public class UserTableRequestDto : PaginationRequest
{
    /// <summary>
    /// list roles of user, separated by comma
    /// </summary>
    public string? Roles { get; set; }
    public bool? IsActive { get; set; }
    public bool? isLocked { get; set; }
}