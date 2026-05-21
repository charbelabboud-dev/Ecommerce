using BCrypt.Net;
using Microsoft.Data.SqlClient;

namespace AdminPasswordUpdater;

class Program
{
    static void Main()
    {
        Console.WriteLine("╔════════════════════════════════════╗");
        Console.WriteLine("║     Admin Credentials Updater      ║");
        Console.WriteLine("╚════════════════════════════════════╝");
        Console.WriteLine("\nLeave field empty to keep current value.\n");

        // Get current admin info first
        string connectionString = "Server=localhost;Database=EcommerceStore;Trusted_Connection=True;TrustServerCertificate=True;";
        string currentUsername = "";
        
        try
        {
            using (var connection = new SqlConnection(connectionString))
            {
                connection.Open();
                
                // Get current admin username (AdminUser_Id = 1)
                string getCurrentSql = "SELECT AdminUser_Username FROM AdminUsers WHERE AdminUser_Id = 1";
                using (var cmd = new SqlCommand(getCurrentSql, connection))
                {
                    var result = cmd.ExecuteScalar();
                    if (result != null)
                    {
                        currentUsername = result.ToString();
                        Console.WriteLine($"Current admin username: {currentUsername}\n");
                    }
                    else
                    {
                        Console.WriteLine("✗ Admin user not found!");
                        Console.WriteLine("Press any key to exit...");
                        Console.ReadKey();
                        return;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error connecting to database: {ex.Message}");
            Console.WriteLine("Press any key to exit...");
            Console.ReadKey();
            return;
        }

        // Get new username
        Console.Write($"Enter new admin username (current: {currentUsername}): ");
        string? newUsername = Console.ReadLine();

        // Get new password
        Console.Write("Enter new admin password: ");
        string? newPassword = Console.ReadLine();

        // Show what will be updated
        Console.WriteLine("\n--- Changes to apply ---");
        Console.WriteLine($"Username: {(string.IsNullOrWhiteSpace(newUsername) ? "KEEP CURRENT" : $"UPDATE TO '{newUsername}'")}");
        Console.WriteLine($"Password: {(string.IsNullOrWhiteSpace(newPassword) ? "KEEP CURRENT" : "UPDATE TO NEW PASSWORD")}");
        Console.WriteLine();

        // Confirm before proceeding
        Console.Write("Apply these changes? (y/n): ");
        string? confirm = Console.ReadLine();
        if (confirm?.ToLower() != "y")
        {
            Console.WriteLine("Update cancelled.");
            Console.WriteLine("Press any key to exit...");
            Console.ReadKey();
            return;
        }

        try
        {
            using (var connection = new SqlConnection(connectionString))
            {
                connection.Open();
                
                var updates = new List<string>();
                var parameters = new List<SqlParameter>();
                
                // Update username if provided
                if (!string.IsNullOrWhiteSpace(newUsername))
                {
                    updates.Add("AdminUser_Username = @username");
                    parameters.Add(new SqlParameter("@username", newUsername));
                }
                
                // Update password if provided
                if (!string.IsNullOrWhiteSpace(newPassword))
                {
                    string hashedPassword = BCrypt.Net.BCrypt.HashPassword(newPassword);
                    updates.Add("AdminUser_PasswordHash = @hash");
                    parameters.Add(new SqlParameter("@hash", hashedPassword));
                }
                
                if (updates.Count == 0)
                {
                    Console.WriteLine("No changes provided. Exiting...");
                    Console.WriteLine("Press any key to exit...");
                    Console.ReadKey();
                    return;
                }
                
                // Always update timestamp
                updates.Add("AdminUser_UpdatedAt = GETDATE()");
                
                // Use AdminUser_Id = 1 (first admin) instead of username
                string sql = $"UPDATE AdminUsers SET {string.Join(", ", updates)} WHERE AdminUser_Id = 1";
                
                using (var command = new SqlCommand(sql, connection))
                {
                    command.Parameters.AddRange(parameters.ToArray());
                    int rowsAffected = command.ExecuteNonQuery();
                    
                    if (rowsAffected > 0)
                    {
                        Console.WriteLine("\n✓ Admin credentials updated successfully!");
                        
                        if (!string.IsNullOrWhiteSpace(newUsername))
                            Console.WriteLine($"  → Username changed to: {newUsername}");
                        if (!string.IsNullOrWhiteSpace(newPassword))
                            Console.WriteLine($"  → Password changed: [HASHED]");
                    }
                    else
                    {
                        Console.WriteLine("\n✗ No rows were updated. Admin user not found!");
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"\n✗ Error: {ex.Message}");
        }

        Console.WriteLine("\nPress any key to exit...");
        Console.ReadKey();
    }
}