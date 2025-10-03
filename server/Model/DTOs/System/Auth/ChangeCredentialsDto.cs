using System;
using System.ComponentModel.DataAnnotations;

namespace Model.DTOs.System.Auth
{
    /// <summary>
    /// DTO for handling email change requests
    /// </summary>
    public class ChangeEmailDto
    {
        /// <summary>
        /// Current password for verification
        /// </summary>
        [Required]
        public string Password { get; set; }
        /// <summary>
        /// New email address
        /// </summary>
        [Required]
        [EmailAddress]
        public string NewEmail { get; set; }
    }

    /// <summary>
    /// DTO for password change requests
    /// </summary>
    public class ChangePasswordDto
    {
        /// <summary>
        /// Current password for verification
        /// </summary>
        [Required]
        public string OldPassword { get; set; }

        /// <summary>
        /// New password
        /// </summary>
        [Required]
        [MinLength(8)]
        public string NewPassword { get; set; }
        
    }
}