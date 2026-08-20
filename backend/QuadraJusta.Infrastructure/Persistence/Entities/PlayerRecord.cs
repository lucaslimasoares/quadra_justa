namespace QuadraJusta.Infrastructure.Persistence.Entities;

public sealed class PlayerRecord
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Initials { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public double Level { get; set; }
    public string Trait { get; set; } = string.Empty;
    public string Sports { get; set; } = "[]";
    public ICollection<MatchPlayerRecord> Matches { get; set; } = [];
}
