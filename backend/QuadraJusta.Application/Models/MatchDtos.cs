namespace QuadraJusta.Application.Models;

public sealed record PlayerDto(Guid Id, string Name, string Initials, string Position, double Level, string Trait);
public sealed record CreatePlayerRequest(string Name, string Position, double Level, string? Trait);
public sealed record MatchDto(Guid Id, string Title, DateTimeOffset Date, string Venue, int MaxPlayers, int ConfirmedCount, IReadOnlyList<PlayerDto> Players);
public sealed record GenerateTeamsRequest(int TeamCount, bool SeparateGoalkeepers, bool KeepCaioAndNetoTogether);
public sealed record TeamDto(string Name, string Color, double TotalLevel, double AverageLevel, IReadOnlyList<PlayerDto> Players);
public sealed record TeamsDto(int BalancePercentage, IReadOnlyList<TeamDto> Teams, string Explanation);
