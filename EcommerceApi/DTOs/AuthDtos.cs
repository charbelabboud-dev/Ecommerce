using System.ComponentModel.DataAnnotations;

namespace EcommerceApi.DTOs;

public class CustomerRegisterRequest
{
    [Required, StringLength(200, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required, EmailAddress, StringLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required, StringLength(100, MinimumLength = 8)]
    public string Password { get; set; } = string.Empty;

    [Required, StringLength(50, MinimumLength = 7)]
    [RegularExpression(@"^[\d\s\-\+\(\)]{7,20}$", ErrorMessage = "Invalid phone number format.")]
    public string Phone { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Address { get; set; }
}

public class CustomerLoginRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class VerifyOtpRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, StringLength(6, MinimumLength = 6)]
    [RegularExpression(@"^\d{6}$", ErrorMessage = "OTP must be a 6-digit code.")]
    public string OtpCode { get; set; } = string.Empty;
}

public class ResendOtpRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;
}

public class ForgotPasswordRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;
}

public class ResetPasswordRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, StringLength(6, MinimumLength = 6)]
    [RegularExpression(@"^\d{6}$", ErrorMessage = "OTP must be a 6-digit code.")]
    public string OtpCode { get; set; } = string.Empty;

    [Required, StringLength(100, MinimumLength = 8)]
    public string NewPassword { get; set; } = string.Empty;
}

public class AdminLoginRequest
{
    [Required, StringLength(100, MinimumLength = 3)]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class AdminRegisterRequest
{
    [Required, StringLength(100, MinimumLength = 3)]
    public string Username { get; set; } = string.Empty;

    [Required, StringLength(100, MinimumLength = 8)]
    public string Password { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, StringLength(200)]
    public string StoreName { get; set; } = string.Empty;

    [Required, StringLength(50, MinimumLength = 7)]
    [RegularExpression(@"^[\d\s\-\+\(\)]{7,20}$", ErrorMessage = "Invalid phone number format.")]
    public string StorePhone { get; set; } = string.Empty;

    [StringLength(500)]
    public string? StoreAddress { get; set; }
}
