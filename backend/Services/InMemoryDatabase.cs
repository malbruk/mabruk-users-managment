using System.Collections.Concurrent;
using System.Collections.Generic;
using Backend.Models;

namespace Backend.Services;

public class InMemoryDatabase
{
    private readonly ConcurrentDictionary<Guid, Organization> _organizations = new();
    private readonly ConcurrentDictionary<Guid, UserAccount> _usersById = new();
    private readonly ConcurrentDictionary<string, Guid> _userIdsByEmail = new(StringComparer.OrdinalIgnoreCase);
    private readonly ConcurrentDictionary<(Guid UserId, Guid OrganizationId), Membership> _memberships = new();

    public InMemoryDatabase()
    {
        var demoOrganization = new Organization
        {
            Id = Guid.Parse("11111111-2222-3333-4444-555555555555"),
            Name = "Demo Organization",
            Slug = "demo"
        };

        _organizations[demoOrganization.Id] = demoOrganization;
    }

    public IEnumerable<Organization> Organizations => _organizations.Values;

    public Organization? GetOrganization(Guid organizationId)
    {
        _organizations.TryGetValue(organizationId, out var organization);
        return organization;
    }

    public bool TryAddOrganization(Organization organization)
    {
        return _organizations.TryAdd(organization.Id, organization);
    }

    public bool TryAddUser(UserAccount user)
    {
        if (!_userIdsByEmail.TryAdd(user.Email, user.Id))
        {
            return false;
        }

        _usersById[user.Id] = user;
        return true;
    }

    public UserAccount? FindUserByEmail(string email)
    {
        if (_userIdsByEmail.TryGetValue(email, out var userId) && _usersById.TryGetValue(userId, out var user))
        {
            return user;
        }

        return null;
    }

    public Membership? GetMembership(Guid userId, Guid organizationId)
    {
        _memberships.TryGetValue((userId, organizationId), out var membership);
        return membership;
    }

    public Membership AddMembership(Guid userId, Guid organizationId, string role)
    {
        if (_memberships.TryGetValue((userId, organizationId), out var existing))
        {
            return existing;
        }

        var membership = new Membership
        {
            UserId = userId,
            OrganizationId = organizationId,
            Role = role
        };

        _memberships[(userId, organizationId)] = membership;
        return membership;
    }
}
