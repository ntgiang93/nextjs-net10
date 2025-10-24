using Common.Exceptions;
using Common.Extensions;
using Common.Security;
using Mapster.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Model.Constants;
using Model.DTOs.Base;
using Model.DTOs.System;
using Model.DTOs.System.Auth;
using Model.DTOs.System.File;
using Model.DTOs.System.Role;
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
        return await CacheManager.GetOrCreateAsync<PaginatedResultDto<UserTableDto>>(cacheKey, async () =>
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

    public async Task<UserDto> GetDetailAsync(string userId)
    {
        var user = await _userRepository.GetDetailAsync(userId);
        if (user != null)
        {
            var domain = _appSettings.AppDomain;
            user.Avatar = string.IsNullOrEmpty(user.Avatar)
                ? user.Avatar
                : $"{domain}{user.Avatar}";
        }

        return user;
    }

    public async Task<PaginatedResultDto<UserSelectDto>> GetPagination2SelectAsync(PaginationRequest request)
    {
        var cacheKey = CacheManager.GenerateCacheKey($"{_cachePrefix}GetPagination2SelectAsync", request);
        return await CacheManager.GetOrCreateAsync<PaginatedResultDto<UserSelectDto>>(cacheKey, async () =>
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

    public async Task<string> CreateUserAsync(CreateUserDto model)
    {
        if(!string.IsNullOrWhiteSpace(model.UserName))
        {
            await ValidateUniqueUser(model.Email, model.PhoneNumber, model.UserName);
        }
        else
        {
            var name = model.FullName.Split(' ');
            var prefix = name[^1].ToLower() + model.FullName.Replace(name[^1], "").Trim().GetInitials();
            var lastUserMatch = await _userRepository.FindLastUserByUserNamePrefixAsync(prefix);
            if (lastUserMatch == null)
            {
                model.UserName = prefix + "001";
            }
            else
            {
                var lastUserName = lastUserMatch.UserName;
                var lastUserSuffix = lastUserName.Substring(prefix.Length);
                var nextSuffix = int.Parse(lastUserSuffix) + 1;
                model.UserName = $"{prefix}{nextSuffix:D3}";
            }
        }

        var user = new User
        {
            UserName = model.UserName,
            FullName = model.FullName,
            Email = model.Email ?? string.Empty,
            Phone = model.PhoneNumber,
            PasswordHash = PasswordHelper.HashPassword($"!{model.UserName}@2k25")
        };

        // Add user to database
        var id = await CreateAsync(user);
        if (!string.IsNullOrEmpty(id))
        {
            await _userRoleService.AddUserRoleAsync(model.Roles.Select(r => new UserRole()
            {
                UserId = id,
                RoleId = r
            }));
        }

        return id;
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
            await _userRoleService.UpdateUserRoleAsync(model.Roles.Select(r => new UserRole()
            {
                UserId = user.Id,
                RoleId = r
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

    public async Task<bool> AssignRolesAsync(string userId, List<UserRole> roles)
    {
        var user = await _userRepository.GetByIdAsync<User>(userId);
        if (user == null) throw new NotFoundException(SysMsg.Get(EMessage.UserNotFound), "USER_NOT_FOUND");

        // Clear existing roles
        var existingRoles = await _userRoleService.GetAllByUserAsync(userId);
        if (existingRoles.Any()) await _userRoleService.DeleteUserRoleAsync(existingRoles);

        var result = await _userRoleService.AddUserRoleAsync(roles);
        return result;
    }

    public async Task<bool> ChangeActiveStatus(string id)
    {
        var user = await _userRepository.GetByIdAsync<User>(id);
        if (user == null)
            throw new NotFoundException(SysMsg.Get(EMessage.UserNotFound), "USER_NOT_FOUND");

        user.IsActive = !user.IsActive;
        var updatedUser = await UpdateAsync(user);
        return updatedUser;
    }

    public async Task<bool> ValidateUniqueUser(string? email, string? phoneNumber, string? username,
        string userId = default)
    {
        User existingUser;
        if (userId != default)
            existingUser = await _userRepository.GetSingleAsync<User>(u =>
                u.Id != userId && (u.Email == email || u.Phone == phoneNumber || u.UserName == username));
        else
            existingUser = await _userRepository.GetSingleAsync<User>(u =>
                u.Email == email || u.Phone == phoneNumber || u.UserName == username);
        if (existingUser != null && existingUser.UserName == username)
            throw new BusinessException(SysMsg.Get(EMessage.UserNameExisted), "USERNAME_EXISTS");
        if (existingUser != null && existingUser.Email == email && !string.IsNullOrWhiteSpace(existingUser.Email))
            throw new BusinessException(SysMsg.Get(EMessage.EmailExisted), "EMAIL_EXISTS");
        if (existingUser != null && existingUser.Phone == phoneNumber && !string.IsNullOrWhiteSpace(existingUser.Phone))
            throw new BusinessException(SysMsg.Get(EMessage.PhoneExisted), "PHONE_EXISTS");
        return true;
    }

    public async Task<IEnumerable<RoleClaimDto>> GetUserRoleAsync(string userId)
    {
        return await _userRepository.GetRolesAsync(userId);
    }

    public async Task<List<RolePermission>> GetUserPermissionsAsync(string userId)
    {
        var cacheKey = CacheManager.GenerateCacheKey($"{_cachePrefix}GetUserPermissionsAsync", userId);
        return await CacheManager.GetOrCreateAsync(cacheKey, async () =>
        {
            // Get all roles for the user
            var userRoles = await GetUserRoleAsync(userId);
            if (userRoles == null || !userRoles.Any())
                return new List<RolePermission>();

            // Get permissions for each role and combine them
            var allPermissions = new HashSet<RolePermission>();
            foreach (var role in userRoles)
            {
                var rolePermissions = await _permissionService.GetRolePermissionAsync(role.Id);
                if (rolePermissions != null)
                {
                    foreach (var permission in rolePermissions)
                    {
                        allPermissions.Add(permission);
                    }
                }
            }

            return allPermissions.ToList();
        });
    }

    public async Task<List<RolePermission>> GetCurrentUserPermissionsAsync()
    {
        // Get the current user ID from the context
        var currentUser = UserContext.Current;
        if (currentUser == null || string.IsNullOrEmpty(currentUser.UserId))
            return new List<RolePermission>();

        // Get permissions for the current user
        return await GetUserPermissionsAsync(currentUser.UserId);
    }

    public async Task<bool> UpdateAvatarAsync(IFormFile file, string userId)
    {
        var user = await GetByIdAsync<User>(userId);
        if (user == null)
            throw new NotFoundException(SysMsg.Get(EMessage.UserNotFound), "USER_NOT_FOUND");
        if (file == null || file.Length == 0)
            throw new BusinessException(SysMsg.Get(EMessage.FileRequired), "FILE_REQUIRED");
        FileUploadDto dto = new FileUploadDto()
        {
            ReferenceId = userId,
            ReferenceType = nameof(User) + "_avatar",
            File = file
        };
        if (!string.IsNullOrWhiteSpace(user.Avatar)) await _fileService.DeleteFileByReference(dto.ReferenceType, dto.ReferenceId);
        var newFile = await _fileService.UploadFileAsync(dto);
        user.Avatar = newFile.FilePath.Replace(Path.DirectorySeparatorChar, '/');
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