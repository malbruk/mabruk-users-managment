namespace Backend.Models;

public class Membership
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public Guid UserId { get; init; }
    public Guid OrganizationId { get; init; }
    public string Role { get; set; } = "member";
    public DateTimeOffset JoinedAt { get; init; } = DateTimeOffset.UtcNow;
}
