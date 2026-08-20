namespace QuadraJusta.Domain.Entities;

public sealed class Match
{
    public Match(Guid id, string title, DateTimeOffset date, string venue, int maxPlayers, IReadOnlyList<Player> players)
    { Id = id; Title = title; Date = date; Venue = venue; MaxPlayers = maxPlayers; Players = players; }
    public Guid Id { get; }
    public string Title { get; }
    public DateTimeOffset Date { get; }
    public string Venue { get; }
    public int MaxPlayers { get; }
    public IReadOnlyList<Player> Players { get; }
}
