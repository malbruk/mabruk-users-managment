using System.ComponentModel.DataAnnotations;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Identity;

namespace Backend.Routes;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/register", RegisterAsync);
        group.MapPost("/login", LoginAsync);

        return app;
    }

    private static IResult RegisterAsync(
        RegisterRequest request,
        InMemoryDatabase database,
        IPasswordHasher<UserAccount> passwordHasher,
        ITokenService tokenService)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return Results.BadRequest(new { error = "Email is required." });
        }

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 8)
        {
            return Results.BadRequest(new { error = "Password must be at least 8 characters long." });
        }

        if (request.OrganizationId == Guid.Empty)
        {
            return Results.BadRequest(new { error = "OrganizationId is required." });
        }

        var organization = database.GetOrganization(request.OrganizationId);
        if (organization is null)
        {
            return Results.NotFound(new { error = "Organization not found." });
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        if (database.FindUserByEmail(normalizedEmail) is not null)
        {
            return Results.Conflict(new { error = "A user with this email already exists." });
        }

        var user = new UserAccount
        {
            Email = normalizedEmail
        };
        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

        if (!database.TryAddUser(user))
        {
            return Results.Conflict(new { error = "A user with this email already exists." });
        }

        var membership = database.AddMembership(user.Id, organization.Id, string.IsNullOrWhiteSpace(request.Role) ? "member" : request.Role.Trim().ToLowerInvariant());

        var token = tokenService.CreateAccessToken(user, membership);
        var response = new AuthResponse(user.Id, organization.Id, membership.Role, token);

        return Results.Created($"/api/users/{user.Id}", response);
    }

    private static IResult LoginAsync(
        LoginRequest request,
        InMemoryDatabase database,
        IPasswordHasher<UserAccount> passwordHasher,
        ITokenService tokenService)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return Results.BadRequest(new { error = "Email and password are required." });
        }

        if (request.OrganizationId == Guid.Empty)
        {
            return Results.BadRequest(new { error = "OrganizationId is required." });
        }

        var user = database.FindUserByEmail(request.Email.Trim().ToLowerInvariant());
        if (user is null)
        {
            return Results.Unauthorized();
        }

        var verification = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verification == PasswordVerificationResult.Failed)
        {
            return Results.Unauthorized();
        }

        if (verification == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
        }

        var membership = database.GetMembership(user.Id, request.OrganizationId);
        if (membership is null)
        {
            return Results.Forbid();
        }

        var token = tokenService.CreateAccessToken(user, membership);
        var response = new AuthResponse(user.Id, membership.OrganizationId, membership.Role, token);

        return Results.Ok(response);
    }

    private record RegisterRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; init; } = string.Empty;

        [Required]
        public string Password { get; init; } = string.Empty;

        [Required]
        public Guid OrganizationId { get; init; }

        public string Role { get; init; } = "member";
    }

    private record LoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; init; } = string.Empty;

        [Required]
        public string Password { get; init; } = string.Empty;

        [Required]
        public Guid OrganizationId { get; init; }
    }

    private record AuthResponse(Guid UserId, Guid OrganizationId, string Role, string AccessToken);
}
