namespace QuadraJusta.Infrastructure.Persistence.Entities;

public sealed class MatchRecord
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTimeOffset Date { get; set; }
    public string Venue { get; set; } = string.Empty;
    public int MaxPlayers { get; set; }
    public string Privacy { get; set; } = "public";
    public string? CreatorEmail { get; set; }
    public string InvitedEmails { get; set; } = "[]";
    public string ModeratorEmails { get; set; } = "[]";
    public string? Notes { get; set; }
    public ICollection<MatchPlayerRecord> Players { get; set; } = [];
}
