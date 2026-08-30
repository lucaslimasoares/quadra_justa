using QuadraJusta.Application.Services;

namespace QuadraJusta.Application.Models;

public sealed record PlayerDto(Guid Id, string Name, string Initials, string Position, double Level, string Trait, IReadOnlyList<string> Sports);
public sealed record CreatePlayerRequest(string Name, string Position, double Level, string? Trait, IReadOnlyList<string>? Sports);
public sealed record MatchDto(Guid Id, string Title, DateTimeOffset Date, string Venue, int MaxPlayers, int ConfirmedCount, IReadOnlyList<PlayerDto> Players, string Privacy, string? CreatorEmail, IReadOnlyList<string> InvitedEmails, IReadOnlyList<string> AdministratorEmails, IReadOnlyList<string> MatchRules, IReadOnlyList<string> DrawRules, string CurrentRole, MatchPermissions Permissions);
public sealed record CreateMatchRequest(string Title, DateTimeOffset Date, string Venue, int MaxPlayers, string Privacy, string CreatorEmail, IReadOnlyList<string>? InvitedEmails, IReadOnlyList<string>? ModeratorEmails, IReadOnlyList<string>? MatchRules, IReadOnlyList<string>? DrawRules, string? Notes, IReadOnlyList<string>? AdministratorEmails);
public sealed record GenerateTeamsRequest(int TeamCount, bool SeparateGoalkeepers, bool KeepCaioAndNetoTogether);
public sealed record TeamDto(string Name, string Color, double TotalLevel, double AverageLevel, IReadOnlyList<PlayerDto> Players);
public sealed record TeamsDto(int BalancePercentage, IReadOnlyList<TeamDto> Teams, string Explanation);
