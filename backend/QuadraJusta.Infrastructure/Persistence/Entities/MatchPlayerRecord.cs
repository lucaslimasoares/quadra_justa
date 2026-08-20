namespace QuadraJusta.Infrastructure.Persistence.Entities;

public sealed class MatchPlayerRecord
{
    public Guid MatchId { get; set; }
    public MatchRecord Match { get; set; } = null!;
    public Guid PlayerId { get; set; }
    public PlayerRecord Player { get; set; } = null!;
    public bool IsConfirmed { get; set; }
}
