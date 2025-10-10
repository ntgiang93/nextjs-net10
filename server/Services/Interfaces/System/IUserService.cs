using Microsoft.AspNetCore.Http;
using Model.DTOs.Base;
using Model.DTOs.System;
using Model.DTOs.System.Auth;
using Model.DTOs.System.User;
using Model.Entities.System;
using Model.Models;
using Service.Interfaces.Base;

namespace Service.Interfaces;

public interface IUserService : IGenericService<User, string>
{
    /// <summary>
    ///     Gets all permissions assigned to a specific user through their roles
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <returns>Collection of permission strings assigned to the user</returns>
    Task<List<RolePermission>> GetUserPermissionsAsync(string userId);

    /// <summary>
    /// Gets detailed information of a user by their ID
    /// </summary>
    Task<UserDto> GetDetailAsync(string userId);

    /// <summary>
    ///     Gets permissions of the currently authenticated user
    /// </summary>
    /// <returns>Collection of permission strings for the current user</returns>
    Task<List<RolePermission>> GetCurrentUserPermissionsAsync();

    /// <summary>
    ///     Gets all roles assigned to a specific user
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <returns>Collection of role names assigned to the user</returns>
    Task<IEnumerable<RoleClaimDto>> GetUserRoleAsync(string userId);

    /// <summary>
    ///     Gets paginated list of users based on filter criteria
    /// </summary>
    /// <param name="request">Filter and pagination parameters</param>
    /// <returns>Paginated result containing user data</returns>
    Task<PaginatedResultDto<UserTableDto>> GetPaginationAsync(UserTableRequestDto request);
    /// <summary>
    ///     Gets paginated list of users for selection purposes
    /// </summary>
    /// <param name="request">Filter and pagination parameters</param>
    /// <returns>Paginated result containing user data</returns>
    Task<PaginatedResultDto<UserSelectDto>> GetPagination2SelectAsync(PaginationRequest request);


    /// <summary>
    ///     Creates a new user in the system
    /// </summary>
    /// <param name="model">Data for creating the new user</param>
    /// <returns>userId</returns>
    Task<string> CreateUserAsync(CreateUserDto model);

    /// <summary>
    ///     Updates an existing user's information
    /// </summary>
    /// <param name="model">Updated user data</param>
    /// <returns>True if update was successful, otherwise false</returns>
    Task<bool> UpdateUserAsync(UpdateUserDto model);

    /// <summary>
    ///     Validates if the provided email, phone number, or username is unique for the user.
    /// </summary>
    /// <param name="email">Email to validate</param>
    /// <param name="phoneNumber">Phone number to validate</param>
    /// <param name="username">Username to validate</param>
    /// <param name="userId">User ID to exclude from validation (for updates)</param>
    /// <returns>True if all provided values are unique, otherwise false</returns>
    Task<bool> ValidateUniqueUser(string? email, string? phoneNumber, string? username, string userId = default);

    /// <summary>
    ///     Toggles a user's active status (active/inactive)
    /// </summary>
    /// <param name="id">ID of the user to update</param>
    /// <returns>True if status was changed successfully, otherwise false</returns>
    Task<bool> ChangeActiveStatus(string id);

    /// <summary>
    ///     Verifies a user's email change request
    /// </summary>
    /// <param name="dto">Verification data including token and email</param>
    /// <returns>True if email was verified successfully, otherwise false</returns>
    Task<bool> VerifyEmailChangeAsync(VerifyAccountDto dto);

    /// <summary>
    ///     Changes a user's email address after password verification
    /// </summary>
    /// <param name="newEmail">New email address</param>
    /// <param name="password">User's current password for verification</param>
    /// <returns>True if email was changed successfully, otherwise false</returns>
    Task<bool> ChangeEmailAsync(string newEmail, string password);

    /// <summary>
    ///     Assigns roles to a specific user
    /// </summary>
    /// <param name="userId">ID of the user</param>
    /// <param name="roles">List of user-role relationships to assign</param>
    /// <returns>True if roles were assigned successfully, otherwise false</returns>
    Task<bool> AssignRolesAsync(string userId, List<UserRole> roles);

    /// <summary>
    ///     Updates a user's avatar/profile picture
    /// </summary>
    /// <param name="file">The image file to use as the new avatar</param>
    /// <param name="userId">ID of the user whose avatar is being updated</param>
    /// <returns>True if avatar was updated successfully, otherwise false</returns>
    Task<bool> UpdateAvatarAsync(IFormFile file, string userId);
}