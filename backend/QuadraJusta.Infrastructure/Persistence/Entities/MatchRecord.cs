namespace QuadraJusta.Infrastructure.Persistence.Entities;

public sealed class MatchRecord
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTimeOffset Date { get; set; }
    public string Venue { get; set; } = string.Empty;
    public int MaxPlayers { get; set; }
    public ICollection<MatchPlayerRecord> Players { get; set; } = [];
}
