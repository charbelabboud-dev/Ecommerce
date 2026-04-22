using System;

namespace EcommerceApi.Models;

public class EmailVerificationOtp
{
    public int Otp_Id { get; set; }
    public string Otp_Email { get; set; } = string.Empty;
    public string Otp_Code { get; set; } = string.Empty;
    public DateTime Otp_ExpiresAt { get; set; }
    public bool Otp_IsUsed { get; set; } = false;
    public DateTime Otp_CreatedAt { get; set; } = DateTime.UtcNow;
}