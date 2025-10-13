using System.ComponentModel.DataAnnotations;

namespace Model.DTOs.System.Auth
{
    public class RegisterUserDto
    {
        [Required]
        [MinLength(3, ErrorMessage = "UserName must be at least 3 characters")]
        public string UserName { get; set; }

        [EmailAddress(ErrorMessage = "Invalid email address")]
        public string Email { get; set; }

        [Required]
        [MinLength(8, ErrorMessage = "Password must be at least 6 characters")]
        public string Password { get; set; }

        [Required]
        [Compare("Password", ErrorMessage = "Passwords do not match")]
        public string ConfirmPassword { get; set; }

        public string? PhoneNumber { get; set; }

        public string Device { get; set; }

        public string IpAddress { get; set; }
    }
}