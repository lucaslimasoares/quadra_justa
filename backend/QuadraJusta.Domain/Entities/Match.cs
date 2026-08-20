namespace QuadraJusta.Domain.Entities;

public sealed class Match
{
    public Match(Guid id, string title, DateTimeOffset date, string venue, int maxPlayers, IReadOnlyList<Player> players, string privacy = "public", string? creatorEmail = null, IReadOnlyList<string>? invitedEmails = null, IReadOnlyList<string>? moderatorEmails = null, IReadOnlyList<string>? matchRules = null, IReadOnlyList<string>? drawRules = null)
    { Id = id; Title = title; Date = date; Venue = venue; MaxPlayers = maxPlayers; Players = players; Privacy = privacy; CreatorEmail = creatorEmail; InvitedEmails = invitedEmails ?? []; ModeratorEmails = moderatorEmails ?? []; MatchRules = matchRules ?? []; DrawRules = drawRules ?? []; }
    public Guid Id { get; }
    public string Title { get; }
    public DateTimeOffset Date { get; }
    public string Venue { get; }
    public int MaxPlayers { get; }
    public IReadOnlyList<Player> Players { get; }
    public string Privacy { get; }
    public string? CreatorEmail { get; }
    public IReadOnlyList<string> InvitedEmails { get; }
    public IReadOnlyList<string> ModeratorEmails { get; }
    public IReadOnlyList<string> MatchRules { get; }
    public IReadOnlyList<string> DrawRules { get; }
}
