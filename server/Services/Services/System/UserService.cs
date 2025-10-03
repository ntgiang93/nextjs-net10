using Common.Exceptions;
using Common.Extensions;
using Common.Security;
using Mapster;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Model.Constants;
using Model.DTOs.Base;
using Model.DTOs.System.Auth;
using Model.DTOs.System.File;
using Model.DTOs.System.User;
using Model.Entities.System;
using Model.Models;
using Repository.Interfaces.System;
using Service.Interfaces;
using Service.Interfaces.Base;
using Service.Interfaces.System;
using Service.Services.Base;

namespace Service.Services.System;

public class UserService : GenericService<User, string>, IUserService
{
    private readonly IEmailSmsService _emailSmsService;
    private readonly IUserRepository _userRepository;
    private readonly IUserRoleService _userRoleService;
    private readonly IPermissionService _permissionService;
    private readonly IFileService _fileService;
    private readonly AppSettings _appSettings;

    public UserService(IUserRepository repository, IServiceProvider serviceProvider, IEmailSmsService emailSmsService,
        IUserRoleService userRoleService, IPermissionService permissionService, IFileService fileService,
        AppSettings appSettings) : base(repository,
        serviceProvider)
    {
        _userRepository = repository;
        _emailSmsService = emailSmsService;
        _userRoleService = userRoleService;
        _permissionService = permissionService;
        _fileService = fileService;
        _appSettings = appSettings;
    }

    public async Task<PaginatedResultDto<UserTableDto>> GetPaginationAsync(UserTableRequestDto request)
    {
        var cacheKey = CacheManager.GenerateCacheKey($"{_cachePrefix}GetPaginationAsync", request);
        return await CacheManager.GetOrCreateAsync(cacheKey, async () =>
        {
            var result = await _userRepository.GetPaginatedUsersAsync(request);
            return new PaginatedResultDto<UserTableDto>
            {
                Items = result.Items,
                TotalCount = result.TotalCount,
                PageIndex = request.Page,
                PageSize = request.PageSize
            };
        });
    }

    public async Task<UserDto> GetDetailAsync(long userId)
    {
        var user = await _userRepository.GetDetailAsync(userId);
        if (user != null)
        {
            user.Avatar = string.IsNullOrEmpty(user.Avatar)
                ? user.Avatar
                : $"{_appSettings.FileDomain}{user.Avatar}";
        }

        return user;
    }

    public async Task<PaginatedResultDto<UserSelectDto>> GetPagination2SelectAsync(PaginationRequest request)
    {
        var cacheKey = CacheManager.GenerateCacheKey($"{_cachePrefix}GetPagination2SelectAsync", request);
        return await CacheManager.GetOrCreateAsync(cacheKey, async () =>
        {
            var result = await _userRepository.GetPaginatedUser2SelectAsync(request);
            return new PaginatedResultDto<UserSelectDto>
            {
                Items = result.Items,
                TotalCount = result.TotalCount,
                PageIndex = request.Page,
                PageSize = request.PageSize
            };
        });
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto model)
    {
        var name = model.FullName.Split(' ');
        var prefix = name[^1].ToLower() + model.FullName.Replace(name[^1], "").Trim().GetInitials();
        var lastUserMatch = await _userRepository.FindLastUserByUsernamePrefixAsync(prefix);
        string userName;
        if (lastUserMatch == null)
        {
            userName = prefix + "001";
        }
        else
        {
            var lastUserName = lastUserMatch.Username;
            var lastUserSuffix = lastUserName.Substring(prefix.Length);
            var nextSuffix = int.Parse(lastUserSuffix) + 1;
            userName = $"{prefix}{nextSuffix:D3}";
        }

        await ValidateUniqueUser(model.Email, model.PhoneNumber, null);
        var user = new User
        {
            Username = userName,
            FullName = model.FullName,
            Email = model.Email ?? string.Empty,
            Phone = model.PhoneNumber,
            PasswordHash = PasswordHelper.HashPassword($"!{userName}@2k25")
        };

        // Add user to database
        var createdUser = await CreateAsync(user);
        if (createdUser != null)
        {
            await _userRoleService.AddUserRolesAsync(model.Roles.Select(r => new UserRoles()
            {
                UserId = createdUser.Id,
                RoleId = long.Parse(r)
            }));
        }

        return createdUser.Adapt<UserDto>();
    }

    public async Task<bool> UpdateUserAsync(UpdateUserDto model)
    {
        var user = await _userRepository.GetByIdAsync<User>(model.Id);
        if (user == null)
            throw new NotFoundException(SysMsg.Get(EMessage.UserNotFound), "USER_NOT_FOUND");

        user.FullName = string.IsNullOrWhiteSpace(model.FullName) ? user.FullName : model.FullName;
        user.Email = model.Email ?? user.Email;
        user.Phone = model.PhoneNumber;
        var updatedUser = await UpdateAsync(user);
        if (updatedUser)
        {
            await _userRoleService.UpdateUserRolesAsync(model.Roles.Select(r => new UserRoles()
            {
                UserId = user.Id,
                RoleId = long.Parse(r)
            }), user.Id);
        }

        return updatedUser;
    }

    public async Task<bool> ChangeEmailAsync(string newEmail, string password)
    {
        var currentUser = UserContext.Current;
        var user = await GetByIdAsync<User>(currentUser.UserId);
        if (user == null)
            throw new NotFoundException(SysMsg.Get(EMessage.UserNotFound), "USER_NOT_FOUND");

        // Verify current password
        if (!PasswordHelper.VerifyPassword(password, user.PasswordHash))
            throw new BusinessException(SysMsg.Get(EMessage.IncorrectPassword), "INCORRECT_PASSWORD");
        await ValidateUniqueUser(newEmail, null, null, currentUser.UserId);

        var verificationData = new VerificationCacheData(
            Random.Shared.Next(100000, 999999).ToString(),
            newEmail,
            "",
            user.Id
        );
        var verificationId = Guid.NewGuid().ToString();

        var options = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromMinutes(30))
            .SetPriority(CacheItemPriority.Normal);
        await CacheManager.SetCacheAsync(verificationId, verificationData, options);
        await SendWarningEmailChange(verificationData.Code, 30, user.Email);
        await SendVerifyEmailChange(verificationData.Code, 30, newEmail);
        return true;
    }

    public async Task<bool> VerifyEmailChangeAsync(VerifyAccountDto dto)
    {
        var verificationData = await CacheManager.GetCacheAsync<VerificationCacheData>(dto.VerificationId);
        if (verificationData == null)
            throw new BusinessException(SysMsg.Get(EMessage.TokenInvalid));
        var user = await GetByIdAsync<User>(verificationData.UserId);
        if (user == null) throw new NotFoundException(SysMsg.Get(EMessage.Error404Msg));

        user.IsActive = true;
        user.EmailVerified = true;
        var result = await UpdateAsync(user);

        CacheManager.RemoveCache(dto.VerificationId);
        return result;
    }

    public async Task<bool> AssignRolesAsync(long userId, List<UserRoles> roles)
    {
        var user = await _userRepository.GetByIdAsync<User>(userId);
        if (user == null) throw new NotFoundException(SysMsg.Get(EMessage.UserNotFound), "USER_NOT_FOUND");

        // Clear existing roles
        var existingRoles = await _userRoleService.GetAllByUserAsync(userId);
        if (existingRoles.Any()) await _userRoleService.DeleteUserRolesAsync(existingRoles);

        var result = await _userRoleService.AddUserRolesAsync(roles);
        return result;
    }

    public async Task<bool> ChangeActiveStatus(long id)
    {
        var user = await _userRepository.GetByIdAsync<User>(id);
        if (user == null)
            throw new NotFoundException(SysMsg.Get(EMessage.UserNotFound), "USER_NOT_FOUND");

        user.IsActive = !user.IsActive;
        var updatedUser = await UpdateAsync(user);
        return updatedUser;
    }

    public async Task<bool> ValidateUniqueUser(string? email, string? phoneNumber, string? username,
        long userId = default)
    {
        User existingUser;
        if (userId != default)
            existingUser = await _userRepository.GetSingleAsync<User>(u =>
                u.Id != userId && (u.Email == email || u.Phone == phoneNumber || u.Username == username));
        else
            existingUser = await _userRepository.GetSingleAsync<User>(u =>
                u.Email == email || u.Phone == phoneNumber || u.Username == username);
        if (existingUser != null && existingUser.Username == username)
            throw new BusinessException(SysMsg.Get(EMessage.UsernameExisted), "USERNAME_EXISTS");
        if (existingUser != null && existingUser.Email == email)
            throw new BusinessException(SysMsg.Get(EMessage.EmailExisted), "EMAIL_EXISTS");
        if (existingUser != null && existingUser.Phone == phoneNumber)
            throw new BusinessException(SysMsg.Get(EMessage.PhoneExisted), "PHONE_EXISTS");
        return true;
    }

    public async Task<IEnumerable<string>> GetUserRolesAsync(long userId)
    {
        return await _userRepository.GetRolesAsync(userId);
    }

    public async Task<IEnumerable<string>> GetUserPermissionsAsync(long userId)
    {
        var cacheKey = CacheManager.GenerateCacheKey($"{_cachePrefix}GetUserPermissionsAsync", userId);
        return await CacheManager.GetOrCreateAsync(cacheKey, async () =>
        {
            // Get all roles for the user
            var userRoles = await GetUserRolesAsync(userId);
            if (userRoles == null || !userRoles.Any())
                return Enumerable.Empty<string>();

            // Get permissions for each role and combine them
            var allPermissions = new HashSet<string>();
            foreach (var role in userRoles)
            {
                var rolePermissions = await _permissionService.GetRolePermissionsStringAsync(role);
                if (rolePermissions != null)
                {
                    foreach (var permission in rolePermissions)
                    {
                        allPermissions.Add(permission);
                    }
                }
            }

            return allPermissions;
        });
    }

    public async Task<IEnumerable<string>> GetCurrentUserPermissionsAsync()
    {
        // Get the current user ID from the context
        var currentUser = UserContext.Current;
        if (currentUser == null || currentUser.UserId <= 0)
            return Enumerable.Empty<string>();

        // Get permissions for the current user
        return await GetUserPermissionsAsync(currentUser.UserId);
    }

    public async Task<bool> UpdateAvatarAsync(IFormFile file, long userId)
    {
        var user = await GetByIdAsync<User>(userId);
        if (user == null)
            throw new NotFoundException(SysMsg.Get(EMessage.UserNotFound), "USER_NOT_FOUND");
        if (file == null || file.Length == 0)
            throw new BusinessException(SysMsg.Get(EMessage.FileRequired), "FILE_REQUIRED");
        FileUploadDto dto = new FileUploadDto();
        dto.ReferenceId = userId.ToString();
        dto.ReferenceType = nameof(User) + "_avatar";
        if (!string.IsNullOrWhiteSpace(user.Avatar)) await _fileService.DeleteFileByPathAsync(user.Avatar);
        var newFile = await _fileService.UploadFileAsync(file, dto);
        user.Avatar = newFile.FilePath;
        return await UpdateAsync(user);
    }

    private async Task SendVerifyEmailChange(string code, int expirationMinutes, string newEmail)
    {
        var template = await _emailSmsService.GetEmailTemplate("ChangeEmail.html");
        if (!string.IsNullOrEmpty(template))
        {
            var body = template.Replace("{VerificationCode}", code)
                .Replace("{ExpirationMinutes}", expirationMinutes.ToString());
            await _emailSmsService.SendSMTPEmailAsync(new EmailMessage
            {
                Subject = SysMsg.Get(EMessage.ChangeEmailSubject),
                Body = body,
                ToEmail = newEmail,
                IsHtml = true
            });
        }
    }

    private async Task SendWarningEmailChange(string code, int expirationMinutes, string oldEmail)
    {
        var template = await _emailSmsService.GetEmailTemplate("WarningEmail.html");
        if (!string.IsNullOrEmpty(template))
        {
            var body = template.Replace("{VerificationCode}", code)
                .Replace("{ExpirationMinutes}", expirationMinutes.ToString());
            await _emailSmsService.SendSMTPEmailAsync(new EmailMessage
            {
                Subject = SysMsg.Get(EMessage.WarningChangeEmailSubject),
                Body = body,
                ToEmail = oldEmail,
                IsHtml = true
            });
        }
    }
}