using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Authorization;
using Backend.Config;
using Backend.Middleware;
using Backend.Models;
using Backend.Routes;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true)
    .AddEnvironmentVariables();

builder.Services.Configure<AppConfig>(builder.Configuration.GetSection("App"));
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));

var jwtOptions = builder.Configuration.GetSection("Jwt").Get<JwtOptions>()
                 ?? throw new InvalidOperationException("Jwt configuration section is missing.");

if (string.IsNullOrWhiteSpace(jwtOptions.SigningKey) || jwtOptions.SigningKey.Length < 32)
{
    throw new InvalidOperationException("Jwt:SigningKey must be configured and at least 32 characters long.");
}

builder.Services.AddSingleton<InMemoryDatabase>();
builder.Services.AddSingleton<IPasswordHasher<UserAccount>, PasswordHasher<UserAccount>>();
builder.Services.AddSingleton<ITokenService, TokenService>();

builder.Services.AddSingleton<IAuthorizationHandler, OrganizationScopeHandler>();

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("OrganizationMember", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.AddRequirements(new OrganizationScopeRequirement());
    });
});

var app = builder.Build();

app.UseMiddleware<RequestLoggingMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

var appConfig = app.Services.GetRequiredService<IOptions<AppConfig>>().Value;
if (!string.IsNullOrWhiteSpace(appConfig.BaseUrl))
{
    app.Urls.Add(appConfig.BaseUrl);
}

app.MapGet("/healthz", (IHostEnvironment environment) =>
{
    var payload = new
    {
        status = "ok",
        environment = environment.EnvironmentName,
        timestamp = DateTimeOffset.UtcNow
    };

    return Results.Json(payload);
});

app.MapGet("/api/organizations", (InMemoryDatabase database) =>
{
    var organizations = database.Organizations.Select(org => new
    {
        org.Id,
        org.Name,
        org.Slug
    });

    return Results.Ok(organizations);
}).WithTags("Organizations");

app.MapAuthEndpoints();

app.MapGet("/api/organizations/{organizationId:guid}/me", (Guid organizationId, ClaimsPrincipal user, InMemoryDatabase database) =>
{
    var userIdClaim = user.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? user.FindFirstValue(JwtRegisteredClaimNames.Sub)
                      ?? user.FindFirstValue("sub");

    if (!Guid.TryParse(userIdClaim, out var userId))
    {
        return Results.Unauthorized();
    }

    var membership = database.GetMembership(userId, organizationId);
    if (membership is null)
    {
        return Results.Forbid();
    }

    return Results.Ok(new
    {
        userId,
        organizationId,
        membership.Role
    });
}).RequireAuthorization("OrganizationMember").WithTags("Organizations");

app.Run();
