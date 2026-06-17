using EcommerceApi.Data;
using Microsoft.AspNetCore.HttpOverrides;
using EcommerceApi.Middleware;
using EcommerceApi.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// ========== CORS (configurable via appsettings / env vars) ==========
var allowedOrigins = builder.Configuration.GetSection("CorsSettings:AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:3000", "http://localhost:3001" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.MaxDepth = 64;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);

builder.Services.AddScoped<EmailService>();

builder.Services.Configure<SupabaseStorageSettings>(builder.Configuration.GetSection("SupabaseStorage"));
builder.Services.Configure<R2Settings>(builder.Configuration.GetSection("R2Settings"));
builder.Services.AddHttpClient("SupabaseStorage");
builder.Services.AddSingleton<SupabaseImageStorageService>();
builder.Services.AddSingleton<IImageStorageService>(sp =>
{
    var supabaseSettings = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<SupabaseStorageSettings>>().Value;
    if (supabaseSettings.IsConfigured)
    {
        return sp.GetRequiredService<SupabaseImageStorageService>();
    }

    var r2Settings = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<R2Settings>>().Value;
    if (r2Settings.IsConfigured)
    {
        return new R2ImageStorageService(
            sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<R2Settings>>(),
            sp.GetRequiredService<ILogger<R2ImageStorageService>>());
    }

    var logger = sp.GetRequiredService<ILogger<LocalImageStorageService>>();
    logger.LogWarning(
        "No cloud storage configured (SupabaseStorage or R2Settings). Product images will use local disk (ephemeral on Render free tier).");
    return new LocalImageStorageService(
        sp.GetRequiredService<IWebHostEnvironment>(),
        logger);
});

// ========== RATE LIMITING ==========
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddPolicy("auth", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    options.AddPolicy("otp", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(5),
                QueueLimit = 0
            }));

});

// ========== JWT AUTHENTICATION ==========
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["Secret"]
    ?? throw new InvalidOperationException(
        "JWT Secret is missing. Set JwtSettings:Secret via environment variable, user secrets, or appsettings.Development.json.");

if (secretKey.Length < 32)
{
    throw new InvalidOperationException("JWT Secret must be at least 32 characters long.");
}

var issuer = jwtSettings["Issuer"];
var audience = jwtSettings["Audience"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = !string.IsNullOrEmpty(issuer),
        ValidIssuer = issuer,
        ValidateAudience = !string.IsNullOrEmpty(audience),
        ValidAudience = audience,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.FromMinutes(1)
    };
});

builder.Services.AddAuthorization();

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHsts();
}

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseForwardedHeaders();
app.UseStaticFiles();
app.UseCors("AllowReactApp");
app.UseHttpsRedirection();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

var healthResponse = () => Results.Ok(new { status = "ok" });
app.MapGet("/health", healthResponse).DisableRateLimiting();
app.MapMethods("/health", new[] { "HEAD" }, () => Results.Ok()).DisableRateLimiting();

app.MapControllers();

app.Run();
