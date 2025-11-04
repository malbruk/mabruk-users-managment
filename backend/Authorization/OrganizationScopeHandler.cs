using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;

namespace Backend.Authorization;

public class OrganizationScopeHandler : AuthorizationHandler<OrganizationScopeRequirement>
{
    private readonly InMemoryDatabase _database;

    public OrganizationScopeHandler(InMemoryDatabase database)
    {
        _database = database;
    }

    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, OrganizationScopeRequirement requirement)
    {
        if (context.User?.Identity?.IsAuthenticated != true)
        {
            return Task.CompletedTask;
        }

        if (context.Resource is not HttpContext httpContext)
        {
            return Task.CompletedTask;
        }

        if (!httpContext.Request.RouteValues.TryGetValue("organizationId", out var routeValue))
        {
            // If the endpoint is not organization scoped, allow it to proceed.
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        var claimOrganizationId = context.User.FindFirst("org_id")?.Value;
        if (string.IsNullOrEmpty(claimOrganizationId))
        {
            return Task.CompletedTask;
        }

        var routeOrganizationId = Convert.ToString(routeValue, CultureInfo.InvariantCulture);
        if (!Guid.TryParse(routeOrganizationId, out var parsedRoute) || !Guid.TryParse(claimOrganizationId, out var parsedClaim))
        {
            return Task.CompletedTask;
        }

        var userIdClaim = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
                           ?? context.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                           ?? context.User.FindFirstValue("sub");

        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Task.CompletedTask;
        }

        // Ensure the membership exists in the backing store as an extra guard.
        var membership = _database.GetMembership(userId, parsedRoute);

        if (parsedRoute == parsedClaim && membership is not null)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
